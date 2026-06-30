import { motion } from 'framer-motion'
import { ArrowUp, Paperclip, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ChatView() {
  return (
    <div className="relative h-full overflow-y-auto">
      {/* 背景光晕 - 呼应图片中的暖光 */}
      <div className="pointer-events-none absolute inset-0 glow-warm" />
      <div className="pointer-events-none absolute inset-0 glow-cool" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />

      <div className="relative flex min-h-full items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="eyebrow mb-6"
          >
            IMAGE · TEXT · MARKETING
          </motion.div>

          {/* 衬线大字标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-serif-display text-[44px] font-light leading-[1.15] tracking-tightest text-foreground"
          >
            让 AI 先
            <span className="italic">理解</span>
            你，
            <br />
            再替你
            <span className="italic">表达</span>
            。
          </motion.h1>

          {/* 副文 */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-5 max-w-md text-[13px] leading-relaxed text-muted-foreground"
          >
            通过历史内容沉淀长期营销画像，让生成结果更接近你的账号定位、表达习惯和成交方式。
          </motion.p>

          {/* 快捷建议卡 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-10 grid grid-cols-2 gap-2"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={s.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="group rounded-lg border border-border bg-card/50 p-3 text-left transition-all hover:border-foreground/20 hover:bg-card hover:shadow-sm"
              >
                <div className="mb-0.5 text-[13px] font-medium">
                  {s.title}
                </div>
                <div className="text-[11.5px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Composer */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="mt-8"
          >
            <Composer />
            <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
              AI 可能产生错误信息，请核实重要内容 · Enter 发送 · Shift+Enter 换行
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const suggestions = [
  { title: '写一封邮件', desc: '给客户解释项目延期的原因' },
  { title: '解释概念', desc: '用通俗的话讲讲 Transformer' },
  { title: '调试代码', desc: '粘贴报错信息找问题' },
  { title: '头脑风暴', desc: '为新产品起 10 个名字' },
]

function Composer() {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-1 shadow-[0_2px_4px_hsl(var(--foreground)/0.04),0_12px_32px_-12px_hsl(var(--foreground)/0.1)] backdrop-blur-sm">
      <div className="rounded-[10px] bg-background/50 p-3">
        <Textarea
          placeholder="说点什么..."
          className="min-h-[60px] border-0 bg-transparent text-[14px] shadow-none focus-visible:ring-0"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Mic className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            size="icon"
            className="h-7 w-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}