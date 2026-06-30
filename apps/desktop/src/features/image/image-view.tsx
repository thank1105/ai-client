import { motion } from 'framer-motion'
import { Image as ImageIcon, Wand2, Sparkles } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function ImageView() {
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 glow-warm opacity-70" />
      <div className="pointer-events-none absolute inset-0 glow-cool" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />

      <div className="relative flex min-h-full items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="eyebrow mb-6"
          >
            CREATE · WITH · IMAGINATION
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-serif-display text-[44px] font-light leading-[1.15] tracking-tightest text-foreground"
          >
            描述画面，<span className="italic">AI</span>
            <br />
            替你
            <span className="italic">描绘</span>
            。
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-5 max-w-md text-[13px] leading-relaxed text-muted-foreground"
          >
            支持文生图、图生图、局部重绘。基于你的创作历史学习风格偏好，让每次出图都更懂你。
          </motion.p>

          {/* 提示词卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-10 rounded-xl border border-border bg-card/80 p-5 shadow-[0_2px_4px_hsl(var(--foreground)/0.04),0_12px_32px_-12px_hsl(var(--foreground)/0.1)] backdrop-blur-sm"
          >
            <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-eyebrow text-muted-foreground">
              <Wand2 className="h-3 w-3" />
              Prompt
            </div>
            <Textarea
              placeholder="赛博朋克风格的城市夜景，霓虹灯，雨天，电影感构图..."
              className="min-h-[120px] border-0 bg-transparent text-[14px] leading-relaxed shadow-none focus-visible:ring-0"
            />
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
              <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3" /> 1:1
                </span>
                <span className="h-3 w-px bg-border" />
                <span>1024 × 1024</span>
                <span className="h-3 w-px bg-border" />
                <span>4 张</span>
              </div>
              <Button className="bg-primary text-primary-foreground shadow-none hover:bg-primary/90">
                <Sparkles className="h-3.5 w-3.5" />
                开始生成
              </Button>
            </div>
          </motion.div>

          {/* 参数 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-3 grid grid-cols-3 gap-2 text-[12px]"
          >
            {[
              { label: '风格', value: '自动' },
              { label: '比例', value: '1:1' },
              { label: '数量', value: '4' },
            ].map((p) => (
              <button
                key={p.label}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3.5 py-2.5 text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-card hover:text-foreground"
              >
                <span>{p.label}</span>
                <span className="font-mono text-[11px] text-foreground/70">
                  {p.value} <span className="opacity-50">▾</span>
                </span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}