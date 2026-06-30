import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'
export type View = 'chat' | 'image' | 'settings'

interface AppState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  view: View
  setView: (view: View) => void

  sidebarCollapsed: boolean
  toggleSidebar: () => void

  activeConversationId: string | null
  setActiveConversation: (id: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

      view: 'chat',
      setView: (view) => set({ view }),

      sidebarCollapsed: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

      activeConversationId: null,
      setActiveConversation: (id) => set({ activeConversationId: id }),
    }),
    {
      name: 'ai-client-app',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
)