import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: number
  // 后续：附件、tool calls 等
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
  createConversation: (kind: 'chat' | 'image', title?: string) => string
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  togglePin: (id: string) => void
  clearAll: (kind: 'chat' | 'image') => void
}

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],

      createConversation: (kind, title) => {
        const id = generateId()
        const now = Date.now()
        const conv: Conversation = {
          id,
          title: title ?? '新对话',
          kind,
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set({ conversations: [conv, ...get().conversations] })
        return id
      },

      deleteConversation: (id) =>
        set({ conversations: get().conversations.filter((c) => c.id !== id) }),

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
        set({ conversations: get().conversations.filter((c) => c.kind !== kind) }),
    }),
    { name: 'ai-client-conversations' },
  ),
)
