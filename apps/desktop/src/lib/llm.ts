﻿import type { Message } from '@/stores/conversation-store'

/** API 配置（从 app-store 拿） */
export interface LLMConfig {
  apiKey: string
  baseURL: string
  model: string
}

/** 流式回调 */
/**
 * 把用户填的 baseURL 转换成实际请求 URL
 * - Web 环境：https://api.x.com/anthropic -> /llm/anthropic（走 Vite 代理）
 * - Tauri 环境：保持原样（直连）
 */
export function resolveApiUrl(baseURL: string): string {
  const trimmed = baseURL.replace(/\/+$/, '')
  // Web 端：识别是 http(s) 完整 URL 时改为走 /llm 代理
  if (
    import.meta.env.DEV &&
    (trimmed.startsWith('https://') || trimmed.startsWith('http://'))
  ) {
    // 取 host 后面的 path 拼到 /llm 下
    const u = new URL(trimmed)
    return `/llm${u.pathname}`.replace(/\/+$/, '')
  }
  // 兜底：兼容用户填的就是 /llm 相对路径（不再二次加前缀）
  if (trimmed.startsWith('/llm')) {
    return trimmed
  }
  // 普通规则：已含 /v1 不再加
  return trimmed.endsWith('/v1') ? `${trimmed}/messages` : `${trimmed}/v1/messages`
}

export interface StreamCallbacks {
  /** 每个 token 增量回调 */
  onDelta: (delta: string) => void
  /** 整个流结束（成功） */
  onDone: () => void
  /** 错误回调 */
  onError: (err: Error) => void
}

/** Anthropic Messages API 请求格式 */
interface AnthropicRequest {
  model: string
  max_tokens: number
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  system?: string
  stream: true
}

/** Anthropic SSE 事件类型 */
type SSEEvent =
  | { type: 'message_start'; message: { id: string } }
  | {
      type: 'content_block_start'
      content_block: { type: string; text?: string }
    }
  | {
      type: 'content_block_delta'
      delta: { type: 'text_delta'; text: string }
    }
  | { type: 'content_block_stop' }
  | { type: 'message_stop' }
  | { type: 'ping' }
  | { type: 'error'; error: { type: string; message: string } }

/**
 * 把本地消息列表转成 Anthropic 格式
 * - system 单独抽出
 * - user / assistant 角色一一对应（多轮对话）
 */
function toAnthropicMessages(messages: Message[]): {
  system?: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
} {
  const systemMsgs = messages.filter((m) => m.role === 'system')
  const system = systemMsgs.length
    ? systemMsgs.map((m) => m.content).join('\n\n')
    : undefined

  const msgs = messages
    .filter((m) => m.role !== 'system' && m.content)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  return { system, messages: msgs }
}

/**
 * 流式调用 Anthropic Messages API
 * 端点：POST {baseURL}/v1/messages
 */
export async function streamChat(
  config: LLMConfig,
  messages: Message[],
  cb: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const { system, messages: anthropicMsgs } = toAnthropicMessages(messages)

  // 智能转换 baseURL：
  // - Web 环境（vite dev 走 /llm 代理，避开 CORS）：https://x.com/anthropic -> /llm/anthropic
  // - Tauri 环境（直连）：保持完整 URL
  const url = resolveApiUrl(config.baseURL)

  const body: AnthropicRequest = {
    model: config.model,
    max_tokens: 4096,
    messages: anthropicMsgs,
    stream: true,
  }
  if (system) body.system = system

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (e) {
    // 详细诊断：把网络/CORS 错误的更多上下文暴露出来
    const err = e instanceof Error ? e : new Error(String(e))
    const extra =
      '\n\n**诊断信息**：\n' +
      '- name: ' + err.name + '\n' +
      '- message: ' + err.message + '\n' +
      '- 目标 URL: ' + url + '\n' +
      '- 提示：浏览器从 http://localhost:5173 直接调 ' + new URL(url).host + ' 通常会被 CORS 拦截。\n' +
      '  → 方案 A：装 Moesif CORS 插件并启用\n' +
      '  → 方案 B：让 Vite 代理该域（开发期最稳）\n' +
      '  → 方案 C：上 Tauri 后走 Rust 端代理'
    cb.onError(new Error(err.message + extra))
    return
  }

  if (!response.ok || !response.body) {
    // 尝试读出错误信息
    const text = await response.text().catch(() => '')
    cb.onError(
      new Error(
        `HTTP ${response.status}: ${text.slice(0, 300) || response.statusText}`,
      ),
    )
    return
  }

  // 解析 SSE 流
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE 事件以 \n\n 分隔
      let sepIdx: number
      while ((sepIdx = buffer.indexOf('\n\n')) >= 0) {
        const eventBlock = buffer.slice(0, sepIdx)
        buffer = buffer.slice(sepIdx + 2)
        const evt = parseSSEBlock(eventBlock)
        if (!evt) continue

        if (evt.type === 'content_block_delta') {
          cb.onDelta(evt.delta.text)
        } else if (evt.type === 'error') {
          cb.onError(new Error(`${evt.error.type}: ${evt.error.message}`))
          return
        }
      }
    }
    cb.onDone()
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      cb.onDone() // 用户主动中止，视为正常结束
    } else {
      cb.onError(e instanceof Error ? e : new Error(String(e)))
    }
  }
}

/** 解析一个 SSE 事件块 */
function parseSSEBlock(block: string): SSEEvent | null {
  const dataLines: string[] = []
  for (const line of block.split('\n')) {
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
  }
  if (!dataLines.length) return null
  const dataStr = dataLines.join('\n')
  if (dataStr === '[DONE]') return null
  try {
    return JSON.parse(dataStr) as SSEEvent
  } catch {
    return null
  }
}
