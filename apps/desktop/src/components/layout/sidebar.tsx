import { useState, useEffect, useRef } from 'react'
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
  Check,
  X,
  Pencil,
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
    activeId,
    createConversation,
    deleteConversation,
    togglePin,
    renameConversation,
    setActive,
  } = useConversationStore()

  const handleNew = () => {
    createConversation(view === 'image' ? 'image' : 'chat')
  }

  const currentKind = view === 'image' ? 'image' : 'chat'
  // 置顶项排前面，再按更新时间倒序
  const filtered = conversations
    .filter((c) => c.kind === currentKind)
    .slice()
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })

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
                <span className="font-serif text-base italic text-primary-foreground">A</span>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold tracking-tight">AI Client</div>
                <div className="text-[10px] uppercase tracking-eyebrow text-muted-foreground">Studio</div>
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
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* 主导航 */}
      <div className="px-3 pt-5">
        {!sidebarCollapsed && (
          <div className="mb-2 px-2.5 text-[10px] font-medium uppercase tracking-eyebrow text-muted-foreground">Workspace</div>
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
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !sidebarCollapsed && (
                  <motion.div layoutId="active-dot" className="ml-auto h-1 w-1 rounded-full bg-foreground" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 新建 */}
      {view !== 'settings' && (
        <div className="px-3 pt-4">
          <Button onClick={handleNew} variant="default" className={cn('w-full shadow-none', sidebarCollapsed && 'px-0')}>
            <Plus className="h-3.5 w-3.5" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
            <span className="text-[10px] font-medium uppercase tracking-eyebrow text-muted-foreground">Recent</span>
            <span className="text-[10px] text-muted-foreground/60">{filtered.length}</span>
          </div>
          <div className="space-y-0.5 overflow-y-auto px-2 pb-3">
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 py-8 text-center text-[11px] text-muted-foreground/70">
                  还没有{view === 'image' ? '绘画' : '对话'}
                  <br />
                  点击上方按钮开始
                </motion.div>
              ) : (
                filtered.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    active={conv.id === activeId}
                    onSelect={() => setActive(conv.id)}
                    onPin={() => togglePin(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onRename={(title) => renameConversation(conv.id, title)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 底部用户区 */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <div className={cn('flex items-center gap-2.5 rounded-md px-2 py-1.5', !sidebarCollapsed && 'hover:bg-sidebar-accent/40')}>
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[hsl(22_70%_75%)] to-[hsl(35_50%_85%)] text-[11px] font-medium text-foreground">U</div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium">个人空间</div>
                <div className="truncate text-[10px] text-muted-foreground">本地 · 离线可用</div>
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
  active,
  onSelect,
  onPin,
  onDelete,
  onRename,
}: {
  conv: Conversation
  active?: boolean
  onSelect: () => void
  onPin: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(conv.title)
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, conv.title])

  const commit = () => {
    const next = draft.trim()
    if (next && next !== conv.title) onRename(next)
    setEditing(false)
  }

  const cancel = () => {
    setDraft(conv.title)
    setEditing(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      onClick={() => !editing && onSelect()}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
      className={cn(
        'group relative flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors cursor-pointer',
        active
          ? 'bg-sidebar-accent/70 text-foreground'
          : 'text-foreground/85 hover:bg-sidebar-accent/50',
      )}
    >
      {/* 置顶小图标 */}
      {conv.pinned && !editing && (
        <Pin className="h-2.5 w-2.5 shrink-0 fill-primary text-primary" />
      )}

      {editing ? (
        <div className="flex flex-1 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') { e.preventDefault(); cancel() }
            }}
            onBlur={commit}
            className="min-w-0 flex-1 rounded-sm bg-background/60 px-1.5 py-0.5 text-[12.5px] text-foreground outline-none ring-1 ring-primary/40 focus:ring-primary"
          />
          <button onMouseDown={(e) => { e.preventDefault(); commit() }} className="rounded p-1 text-primary hover:bg-primary/10" title="确认 (Enter)">
            <Check className="h-3 w-3" />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); cancel() }} className="rounded p-1 text-muted-foreground hover:bg-foreground/5" title="取消 (Esc)">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <span
          className={cn(
            'flex-1 truncate',
            conv.pinned ? 'font-medium text-foreground' : 'text-foreground/85',
          )}
          title={conv.title}
        >
          {conv.title}
        </span>
      )}

      {!editing && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true) }}
            className="rounded p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            title="重命名"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPin() }}
            className="rounded p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            title={conv.pinned ? '取消置顶' : '置顶'}
          >
            {conv.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="删除"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </motion.div>
  )
}
