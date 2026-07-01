import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  // 流式输出时为 true
  pending?: boolean
}

export interface Conversation {
  id: string
  title: string
  kind: 'chat' | 'image'
  messages: Message[]
  createdAt: number
  updatedAt: number
  pinned?: boolean
}

interface ConversationState {
  conversations: Conversation[]
  activeId: string | null
  // CRUD
  createConversation: (kind: 'chat' | 'image', title?: string) => string
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  togglePin: (id: string) => void
  clearAll: (kind: 'chat' | 'image') => void
  // active
  setActive: (id: string | null) => void
  // messages
  appendMessage: (convId: string, msg: Omit<Message, 'id' | 'createdAt'>) => string
  updateMessage: (convId: string, msgId: string, patch: Partial<Message>) => void
  deleteMessage: (convId: string, msgId: string) => void
}

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,

      createConversation: (kind, title) => {
        const id = generateId()
        const now = Date.now()
        const conv: Conversation = {
          id,
          title: title ?? (kind === 'image' ? '新建绘画' : '新对话'),
          kind,
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set({
          conversations: [conv, ...get().conversations],
          activeId: id,
        })
        return id
      },

      deleteConversation: (id) => {
        const remaining = get().conversations.filter((c) => c.id !== id)
        const newActive = get().activeId === id ? null : get().activeId
        set({ conversations: remaining, activeId: newActive })
      },

      renameConversation: (id, title) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
          ),
        }),

      togglePin: (id) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c,
          ),
        }),

      clearAll: (kind) =>
        set({
          conversations: get().conversations.filter((c) => c.kind !== kind),
          activeId: null,
        }),

      setActive: (id) => set({ activeId: id }),

      appendMessage: (convId, msg) => {
        const message: Message = {
          id: generateId(),
          createdAt: Date.now(),
          ...msg,
        }
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
              : c,
          ),
        })
        return message.id
      },

      updateMessage: (convId, msgId, patch) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, ...patch } : m,
                  ),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        }),

      deleteMessage: (convId, msgId) =>
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) }
              : c,
          ),
        }),
    }),
    { name: 'ai-client-conversations' },
  ),
)
