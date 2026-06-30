import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Pin,
  PinOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore, type View } from '@/stores/app-store'
import {
  useConversationStore,
  type Conversation,
} from '@/stores/conversation-store'

interface NavItem {
  id: View
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: 'chat', label: '对话', icon: MessageSquare },
  { id: 'image', label: '绘画', icon: ImageIcon },
  { id: 'settings', label: '设置', icon: Settings },
]

export function Sidebar() {
  const { view, setView, sidebarCollapsed, toggleSidebar } = useAppStore()
  const {
    conversations,
    createConversation,
    deleteConversation,
    togglePin,
  } = useConversationStore()

  const handleNew = () => {
    createConversation(view === 'image' ? 'image' : 'chat')
  }

  const currentKind = view === 'image' ? 'image' : 'chat'
  const filtered = conversations.filter((c) => c.kind === currentKind)

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 68 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="relative flex h-full flex-col border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl"
    >
      {/* 顶部 Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary">
                <span className="font-serif text-base italic text-primary-foreground">
                  A
                </span>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold tracking-tight">
                  AI Client
                </div>
                <div className="text-[10px] uppercase tracking-eyebrow text-muted-foreground">
                  Studio
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 主导航 */}
      <div className="px-3 pt-5">
        {!sidebarCollapsed && (
          <div className="mb-2 px-2.5 text-[10px] font-medium uppercase tracking-eyebrow text-muted-foreground">
            Workspace
          </div>
        )}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  'group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-[13px] transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    layoutId="active-dot"
                    className="ml-auto h-1 w-1 rounded-full bg-foreground"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 新建 */}
      {view !== 'settings' && (
        <div className="px-3 pt-4">
          <Button
            onClick={handleNew}
            variant="default"
            className={cn('w-full shadow-none', sidebarCollapsed && 'px-0')}
          >
            <Plus className="h-3.5 w-3.5" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  新建{view === 'image' ? '绘画' : '对话'}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      )}

      {/* 会话列表 */}
      {view !== 'settings' && !sidebarCollapsed && (
        <div className="mt-6 flex-1 overflow-hidden">
          <div className="mb-2 flex items-center justify-between px-5">
            <span className="text-[10px] font-medium uppercase tracking-eyebrow text-muted-foreground">
              Recent
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              {filtered.length}
            </span>
          </div>
          <div className="space-y-0.5 overflow-y-auto px-2 pb-3">
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-8 text-center text-[11px] text-muted-foreground/70"
                >
                  还没有{view === 'image' ? '绘画' : '对话'}
                  <br />
                  点击上方按钮开始
                </motion.div>
              ) : (
                filtered.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    onPin={() => togglePin(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 底部用户区 */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2 py-1.5',
            !sidebarCollapsed && 'hover:bg-sidebar-accent/40',
          )}
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[hsl(22_70%_75%)] to-[hsl(35_50%_85%)] text-[11px] font-medium text-foreground">
            U
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <div className="truncate text-[12px] font-medium">个人空间</div>
                <div className="truncate text-[10px] text-muted-foreground">
                  本地 · 离线可用
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

function ConversationItem({
  conv,
  onPin,
  onDelete,
}: {
  conv: Conversation
  onPin: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      className="group relative flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] hover:bg-sidebar-accent/50"
    >
      <span className="flex-1 truncate text-foreground/85">{conv.title}</span>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPin()
          }}
          className="rounded p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
        >
          {conv.pinned ? (
            <PinOff className="h-3 w-3" />
          ) : (
            <Pin className="h-3 w-3" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  )
}