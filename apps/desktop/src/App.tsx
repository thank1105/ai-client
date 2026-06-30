import { AnimatePresence, motion } from 'framer-motion'
import { AppLayout } from '@/components/layout/app-layout'
import { ChatView } from '@/features/chat/chat-view'
import { ImageView } from '@/features/image/image-view'
import { SettingsView } from '@/features/settings/settings-view'
import { useAppStore } from '@/stores/app-store'
import { useThemeSync } from '@/lib/use-theme'

export default function App() {
  useThemeSync()
  const view = useAppStore((s) => s.view)

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {view === 'chat' && <ChatView />}
          {view === 'image' && <ImageView />}
          {view === 'settings' && <SettingsView />}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  )
}
