import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Palette, Database, Info, Eye, EyeOff, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'

export function SettingsView() {
  const { theme, setTheme, apiConfig, setApiConfig } = useAppStore()

  // API 配置本地草稿（输入时实时更新，点击保存才写入 store）
  const [apiKey, setApiKey] = useState(apiConfig.apiKey)
  const [baseURL, setBaseURL] = useState(apiConfig.baseURL)
  const [model, setModel] = useState(apiConfig.model)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  // 当 store 改变时（如 HMR）同步本地草稿
  useEffect(() => {
    setApiKey(apiConfig.apiKey)
    setBaseURL(apiConfig.baseURL)
    setModel(apiConfig.model)
  }, [apiConfig.apiKey, apiConfig.baseURL, apiConfig.model])

  const handleSave = () => {
    setApiConfig({
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      model: model.trim(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const isDirty =
    apiKey !== apiConfig.apiKey ||
    baseURL !== apiConfig.baseURL ||
    model !== apiConfig.model

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 glow-cool opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />

      <div className="relative mx-auto max-w-2xl p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="eyebrow mb-3">Preferences</div>
          <h1 className="font-serif-display text-3xl font-light tracking-tightest">
            设置
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            个性化你的 AI 客户端
          </p>
        </motion.div>

        <div className="mt-10 space-y-6">
          {/* API 配置 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SectionHeader
              icon={<KeyRound className="h-3.5 w-3.5" />}
              title="API 配置"
              desc="用于对话功能；保存后存储在本地"
            />
            <Card className="mt-3">
              <CardContent className="space-y-3 p-5">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] text-muted-foreground">
                    Base URL
                  </label>
                  <Input
                    value={baseURL}
                    onChange={(e) => setBaseURL(e.target.value)}
                    placeholder="https://api.example.com/anthropic"
                    className="font-mono text-[12px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] text-muted-foreground">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="flex-1 pr-9 font-mono text-[12px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        title={showKey ? '隐藏' : '显示'}
                      >
                        {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11.5px] text-muted-foreground">
                    模型名
                  </label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="MiniMax-M3"
                    className="font-mono text-[12px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-muted-foreground/70">
                    当前协议：Anthropic Messages（兼容）
                  </p>
                  <Button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="h-8 gap-1.5"
                  >
                    {saved ? (
                      <><Check className="h-3.5 w-3.5" />已保存</>
                    ) : (
                      '保存配置'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 外观 —— 主题色 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeader
              icon={<Palette className="h-3.5 w-3.5" />}
              title="外观"
              desc="为你的工作台选一个主色调"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {THEMES.map((t) => {
                const active = theme === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={active ? 'group relative overflow-hidden rounded-lg border border-foreground/40 p-2.5 text-left shadow-sm ring-1 ring-foreground/10 transition-all' : 'group relative overflow-hidden rounded-lg border border-border p-2.5 text-left transition-all hover:border-foreground/20'}
                  >
                    <div
                      className="mb-2 h-16 rounded-md border"
                      style={{
                        background: t.swatch,
                        borderColor: t.swatchBorder,
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[12.5px] font-medium leading-tight">{t.label}</div>
                        <div className="text-[10px] uppercase tracking-eyebrow text-muted-foreground/70">{t.sub}</div>
                      </div>
                      {active && (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: 'hsl(var(--primary))' }}
                          aria-label="当前主题"
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* 数据 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeader
              icon={<Database className="h-3.5 w-3.5" />}
              title="数据"
              desc="本地存储与会话管理"
            />
            <Card className="mt-3">
              <CardContent className="space-y-2 p-5 text-[12.5px]">
                <Row label="数据目录">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10.5px]">
                    ~/AppData/Roaming/AI-Client
                  </code>
                </Row>
                <Row label="数据库">
                  <span className="text-muted-foreground/70">localStorage（Web 阶段）</span>
                </Row>
                <Row label="图片存储">
                  <span className="text-muted-foreground/70">即将接入本地文件系统</span>
                </Row>
              </CardContent>
            </Card>
          </motion.div>

          {/* 关于 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SectionHeader
              icon={<Info className="h-3.5 w-3.5" />}
              title="关于"
            />
            <Card className="mt-3">
              <CardContent className="space-y-1 p-5 text-[12.5px] text-muted-foreground">
                <div>AI Client · v0.2.0</div>
                <div>第二阶段：持久化 + LLM 流式对话</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc?: string
}) {
  return (
    <div className="flex items-start gap-3 px-1">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="text-[13px] font-medium">{title}</div>
        {desc && (
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">{desc}</div>
        )}
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

const THEMES: Array<{
  id: 'default' | 'sakura' | 'mint' | 'sunset',
  label: string,
  sub: string,
  swatch: string,
  swatchBorder: string,
}> = [
  {
    id: 'default',
    label: '原色',
    sub: 'Default',
    swatch: 'linear-gradient(135deg, #F0E9D8 0%, #E8E2D3 100%)',
    swatchBorder: '#CFC6B5',
  },
  {
    id: 'sakura',
    label: '樱粉',
    sub: 'Sakura',
    swatch: 'linear-gradient(135deg, #FFD6E2 0%, #FFB3CC 100%)',
    swatchBorder: '#F2A8C0',
  },
  {
    id: 'mint',
    label: '薄荷',
    sub: 'Mint',
    swatch: 'linear-gradient(135deg, #C7F0DE 0%, #8FD9B6 100%)',
    swatchBorder: '#6FC4A0',
  },
  {
    id: 'sunset',
    label: '日落',
    sub: 'Sunset',
    swatch: 'linear-gradient(135deg, #FFD3B0 0%, #FFA66B 100%)',
    swatchBorder: '#F08A4B',
  },
]
