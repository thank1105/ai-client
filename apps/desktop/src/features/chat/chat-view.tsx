import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Paperclip, Mic, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useConversationStore, type Message } from '@/stores/conversation-store'
import { useAppStore } from '@/stores/app-store'
import { streamChat } from '@/lib/llm'

export function ChatView() {
  const conversations = useConversationStore((s) => s.conversations)
  const activeId = useConversationStore((s) => s.activeId)
  const createConversation = useConversationStore((s) => s.createConversation)
  const appendMessage = useConversationStore((s) => s.appendMessage)
  const updateMessage = useConversationStore((s) => s.updateMessage)
  const appendToMessage = useConversationStore((s) => s.appendToMessage)

  const active = conversations.find((c) => c.id === activeId) ?? null
  const hasMessages = (active?.messages.length ?? 0) > 0
  const apiConfig = useAppStore((s) => s.apiConfig)

  return (
    <div className="relative h-full overflow-y-auto">
      {/* 背景光晕 - 呼应图片中的柔光 */}
      <div className="pointer-events-none absolute inset-0 glow-warm" />
      <div className="pointer-events-none absolute inset-0 glow-cool" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />

      <div className="relative flex min-h-full items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          {hasMessages && active ? (
            <MessageList
              messages={active.messages}
              onSend={(text) => sendMessage(text, active.id, apiConfig, active.messages, { appendMessage, updateMessage, appendToMessage })}
            />
          ) : (
            <EmptyHero
              onSend={(text) => {
                if (!active) {
                  const id = createConversation('chat')
                  sendMessage(text, id, apiConfig, [], { appendMessage, updateMessage, appendToMessage })
                } else {
                  sendMessage(text, active.id, apiConfig, active.messages, { appendMessage, updateMessage, appendToMessage })
                }
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* EmptyHero —— 首屏未发消息时显示                                  */
/* ------------------------------------------------------------------ */
function EmptyHero({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="w-full">
      {/* 杂志式 Hero: 上方英文横向水印 / 下方中文主标题 */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
          className="pointer-events-none select-none font-serif-display text-[56px] font-light italic leading-none tracking-[-0.03em] text-foreground/[0.08] flex flex-wrap items-baseline gap-x-6"
        >
          <span>Chat.</span>
          <span>Image.</span>
          <span>Assistant.</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 font-serif-display text-[44px] font-light leading-[1.15] tracking-tightest text-foreground"
        >
          为你
          <span className="italic">创作、绘画、分析</span>
          <span className="text-primary">。</span>
        </motion.h1>
      </div>

      {/* 副文 */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 max-w-md text-[13px] leading-relaxed text-muted-foreground"
      >
        一个桌面端的 AI 工作台，<br />
        聊天、绘画、文件与记忆，都在这里。
      </motion.p>

      {/* 快捷建议卡 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-10 grid grid-cols-2 gap-2"
      >
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.05 }}
            onClick={() => onSend(s.desc)}
            className="group rounded-lg border border-border bg-card/50 p-3 text-left transition-all hover:border-foreground/20 hover:bg-card hover:shadow-sm"
          >
            <div className="mb-0.5 text-[13px] font-medium">{s.title}</div>
            <div className="text-[11.5px] leading-relaxed text-muted-foreground">
              {s.desc}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Composer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="mt-8"
      >
        <Composer onSend={onSend} />
        <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
          AI 可能产生错误信息，请核实重要内容 · Enter 发送 · Shift+Enter 换行
        </p>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MessageList —— 已有消息时显示                                     */
/* ------------------------------------------------------------------ */
function MessageList({
  messages,
  onSend,
}: {
  messages: Message[]
  onSend: (text: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content])

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={scrollRef} className="max-h-[calc(100vh-320px)] space-y-6 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-6">
        <Composer onSend={onSend} />
        <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
          AI 可能产生错误信息，请核实重要内容 · Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border/60',
          isUser ? 'bg-foreground/5' : 'bg-primary/10 text-primary',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm',
          isUser
            ? 'bg-foreground text-background rounded-tr-sm'
            : 'rounded-tl-sm border border-border/60 bg-card text-foreground',
        )}
      >
        {msg.pending ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </span>
        ) : (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Composer —— 输入框 + 发送                                        */
/* ------------------------------------------------------------------ */
function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  const taRef = useRef<HTMLTextAreaElement>(null)



  const handleSend = () => {

    const t = text.trim()

    if (!t) return

    onSend(t)

    setText('')

    requestAnimationFrame(() => taRef.current?.focus())

  }



  return (

    <div className="rounded-xl border border-border bg-card/80 p-1 shadow-[0_2px_4px_hsl(var(--foreground)/0.04),0_12px_32px_-12px_hsl(var(--foreground)/0.1)] backdrop-blur-sm">

      <div className="rounded-[10px] bg-background/50 p-3">

        <Textarea

          ref={taRef}

          value={text}

          onChange={(e) => setText(e.target.value)}

          onKeyDown={(e) => {

            if (e.key === 'Enter' && !e.shiftKey) {

              e.preventDefault()

              handleSend()

            }

          }}

          placeholder="说点什么…"

          className="min-h-[60px] resize-none border-0 bg-transparent text-[14px] shadow-none focus-visible:ring-0"

        />

        <div className="mt-2 flex items-center justify-between">

          <div className="flex items-center gap-0.5">

            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">

              <Paperclip className="h-3.5 w-3.5" />

            </Button>

            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">

              <Mic className="h-3.5 w-3.5" />

            </Button>

          </div>

          <Button

            size="icon"

            onClick={handleSend}

            disabled={!text.trim()}

            className="h-7 w-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"

          >

            <ArrowUp className="h-3.5 w-3.5" />

          </Button>

        </div>

      </div>

    </div>

  )

}



/* ------------------------------------------------------------------ */

/* 发送逻辑 + 假回复（后续接 LLM 时只改这里）                       */

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* 发送逻辑：调 LLM + 流式更新                                       */
/* ------------------------------------------------------------------ */
async function sendMessage(
  text: string,
  convId: string,
  apiConfig: { apiKey: string; baseURL: string; model: string },
  convSnapshot: Message[],
  helpers: {
    appendMessage: (convId: string, msg: Omit<Message, 'id' | 'createdAt'>) => string
    updateMessage: (convId: string, msgId: string, patch: Partial<Message>) => void
    appendToMessage: (convId: string, msgId: string, delta: string) => void
  },
) {
  // 1) 用户消息
  helpers.appendMessage(convId, { role: 'user', content: text })
  // 2) 占位助手消息（pending）
  const pendingId = helpers.appendMessage(convId, {
    role: 'assistant',
    content: '',
    pending: true,
  })

  // 3) 校验 API Key
  if (!apiConfig.apiKey) {
    helpers.updateMessage(convId, pendingId, {
      pending: false,
      content: '⚠️ 请先在「设置」里填写 API Key。',
    })
    return
  }

  // 4) 拼出最新消息列表（包含刚 append 的 user）
  const messages: Message[] = [
    ...convSnapshot,
    { id: 'new-user', role: 'user', content: text, createdAt: Date.now() },
  ]

  // 5) 调用 LLM 流式
  await streamChat(apiConfig, messages, {
    onDelta: (delta) => {
      helpers.appendToMessage(convId, pendingId, delta)
    },
    onDone: () => {
      helpers.updateMessage(convId, pendingId, { pending: false })
    },
    onError: (err) => {
      helpers.updateMessage(convId, pendingId, {
        pending: false,
        content: `\n\n⚠️ **生成失败**：\n\n${err.message}`,
      })
    },
  })
}



const SUGGESTIONS = [

  { title: '写一封邮件', desc: '给客户解释项目延期的原因' },

  { title: '解释概念', desc: '用通俗的话讲讲 Transformer' },

  { title: '调试代码', desc: '粘贴报错信息找问题' },

  { title: '头脑风暴', desc: '为新产品起 10 个名字' },

]
