import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'default' | 'sakura' | 'mint' | 'sunset'
export type View = 'chat' | 'image' | 'settings'

interface AppState {
  theme: Theme
  setTheme: (theme: Theme) => void
  cycleTheme: () => void

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
      theme: 'default',
      setTheme: (theme) => set({ theme }),
      cycleTheme: () =>
        set((s): Partial<AppState> => {
          const order: Theme[] = ['default', 'sakura', 'mint', 'sunset']
          const i = order.indexOf(s.theme)
          return { theme: order[(i + 1) % order.length] }
        }),

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