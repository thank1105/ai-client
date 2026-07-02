/**
 * Storage adapter for AI Client.
 *
 * In Tauri (desktop): all writes/reads go through the Rust backend
 *   - conversations/messages -> SQLite (via tauri-plugin-sql)
 *   - API key                  -> Stronghold (via custom commands)
 *
 * In Web (dev / pnpm dev): falls back to localStorage so the prototype
 * stays usable without the desktop shell.
 *
 * The two paths return the same shapes; callers do not branch on env.
 */

import { isTauri } from './is-tauri'
import type { Conversation, Message } from '@/stores/conversation-store'

const LS_CONVERSATIONS = 'ai-client-conversations'

// ---------- Web (localStorage) fallback ----------

function readLsConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LS_CONVERSATIONS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed?.state?.conversations ?? []
  } catch {
    return []
  }
}

function writeLsConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(
      LS_CONVERSATIONS,
      JSON.stringify({ state: { conversations }, version: 0 }),
    )
  } catch (e) {
    console.error('[storage] ls write failed', e)
  }
}

function getLsApiKey(): string {
  try {
    const raw = localStorage.getItem('ai-client-app')
    if (!raw) return ''
    return JSON.parse(raw)?.state?.apiConfig?.apiKey ?? ''
  } catch {
    return ''
  }
}

function setLsApiKey(key: string): void {
  try {
    const raw = localStorage.getItem('ai-client-app')
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 }
    parsed.state = parsed.state ?? {}
    parsed.state.apiConfig = { ...(parsed.state.apiConfig ?? {}), apiKey: key }
    localStorage.setItem('ai-client-app', JSON.stringify(parsed))
  } catch (e) {
    console.error('[storage] ls apiKey write failed', e)
  }
}

// ---------- Tauri (SQLite + Stronghold) ----------

type SqlDb = {
  execute: (sql: string, params?: unknown[]) => Promise<unknown>
  select: <T>(sql: string, params?: unknown[]) => Promise<T>
}

let _dbPromise: Promise<SqlDb> | null = null
async function getDb(): Promise<SqlDb> {
  if (!_dbPromise) {
    _dbPromise = (async () => {
      const { default: Database } = await import('@tauri-apps/plugin-sql')
      return Database.load('sqlite:ai-client.db')
    })()
  }
  return _dbPromise
}

async function getInvoke() {
  return (await import('@tauri-apps/api/core')).invoke
}

type ConvRow = {
  id: string
  title: string
  kind: 'chat' | 'image'
  pinned: number
  created_at: number
  updated_at: number
}
type MsgRow = {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  pending: number
  created_at: number
}

async function loadAllConversations(): Promise<Conversation[]> {
  const db = await getDb()
  const convs = await db.select<ConvRow[]>(
    'SELECT id, title, kind, pinned, created_at, updated_at FROM conversations ORDER BY updated_at DESC',
  )
  if (convs.length === 0) return []
  const ids = convs.map((c) => c.id)
  const placeholders = ids.map(() => '?').join(',')
  const msgs = await db.select<MsgRow[]>(
    `SELECT id, conversation_id, role, content, pending, created_at
     FROM messages WHERE conversation_id IN (${placeholders})
     ORDER BY created_at ASC`,
    ids,
  )
  const byConv = new Map<string, Message[]>()
  for (const m of msgs) {
    const arr = byConv.get(m.conversation_id) ?? []
    arr.push({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
      pending: !!m.pending,
    })
    byConv.set(m.conversation_id, arr)
  }
  return convs.map((c) => ({
    id: c.id,
    title: c.title,
    kind: c.kind,
    pinned: !!c.pinned,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    messages: byConv.get(c.id) ?? [],
  }))
}

async function upsertConversation(c: Conversation): Promise<void> {
  const db = await getDb()
  await db.execute(
    `INSERT INTO conversations (id, title, kind, pinned, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, kind=excluded.kind, pinned=excluded.pinned,
       updated_at=excluded.updated_at`,
    [c.id, c.title, c.kind, c.pinned ? 1 : 0, c.createdAt, c.updatedAt],
  )
  await db.execute('DELETE FROM messages WHERE conversation_id = ?', [c.id])
  for (const m of c.messages) {
    await db.execute(
      `INSERT INTO messages (id, conversation_id, role, content, pending, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [m.id, c.id, m.role, m.content, m.pending ? 1 : 0, m.createdAt],
    )
  }
}

async function deleteConversationRow(id: string): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM messages WHERE conversation_id = ?', [id])
  await db.execute('DELETE FROM conversations WHERE id = ?', [id])
}

async function clearAllRows(kind: 'chat' | 'image'): Promise<void> {
  const db = await getDb()
  await db.execute(
    'DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE kind = ?)',
    [kind],
  )
  await db.execute('DELETE FROM conversations WHERE kind = ?', [kind])
}

// ---------- Public surface ----------

export const storage = {
  // --- conversations ---
  async loadConversations(): Promise<Conversation[]> {
    if (!isTauri) return readLsConversations()
    return loadAllConversations()
  },

  async saveConversation(c: Conversation): Promise<void> {
    if (!isTauri) {
      const all = readLsConversations()
      const idx = all.findIndex((x) => x.id === c.id)
      if (idx >= 0) all[idx] = c
      else all.unshift(c)
      writeLsConversations(all)
      return
    }
    await upsertConversation(c)
  },

  async deleteConversation(id: string): Promise<void> {
    if (!isTauri) {
      const all = readLsConversations().filter((c) => c.id !== id)
      writeLsConversations(all)
      return
    }
    await deleteConversationRow(id)
  },

  async clearConversations(kind: 'chat' | 'image'): Promise<void> {
    if (!isTauri) {
      const all = readLsConversations().filter((c) => c.kind !== kind)
      writeLsConversations(all)
      return
    }
    await clearAllRows(kind)
  },

  // --- API key (Stronghold on Tauri, ls on Web) ---
  async loadApiKey(): Promise<string> {
    if (!isTauri) return getLsApiKey()
    // Stronghold key needs a password to unlock; storage layer doesn't
    // own that lifecycle. We persist the *password* in sessionStorage
    // after the user unlocks, and the API key is fetched on demand.
    // For v1 we keep things simple: store the in-memory key returned
    // by the unlock flow and let the caller manage it.
    return ''
  },

  async getApiKey(password: string): Promise<string | null> {
    if (!isTauri) return getLsApiKey() || null
    const invoke = await getInvoke()
    const v = await invoke<{ value: string | null }>('secret_get', { password })
    return v?.value ?? null
  },

  async setApiKey(password: string, value: string): Promise<void> {
    if (!isTauri) {
      setLsApiKey(value)
      return
    }
    const invoke = await getInvoke()
    await invoke('secret_set', { password, value })
  },

  async clearApiKey(password: string): Promise<void> {
    if (!isTauri) {
      setLsApiKey('')
      return
    }
    const invoke = await getInvoke()
    await invoke('secret_clear', { password })
  },

  // --- vault status (Tauri only) ---
  async vaultStatus(): Promise<'needs_setup' | 'needs_unlock' | 'unlocked' | 'not_available'> {
    if (!isTauri) return 'not_available'
    const invoke = await getInvoke()
    return invoke('vault_status')
  },

  async vaultInit(password: string): Promise<void> {
    const invoke = await getInvoke()
    await invoke('vault_init', { password })
  },

  async vaultUnlock(password: string): Promise<boolean> {
    const invoke = await getInvoke()
    try {
      await invoke('vault_unlock', { password })
      return true
    } catch {
      return false
    }
  },
}