import { motion } from 'framer-motion'
import { Search, Palette, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'

export function Topbar() {
  const { cycleTheme } = useAppStore()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/40 px-6 backdrop-blur-xl">
      {/* 左：搜索 */}
      <button className="group flex h-8 w-72 items-center gap-2 rounded-md border border-border bg-background/40 px-3 text-[12px] text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-background/60">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">搜索会话、图片...</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground group-hover:flex">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* 右 */}
      <div className="flex items-center gap-1">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="切换主题"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  )
}