import { useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

/** 把 store 里的 theme 同步到 <html> 的 class 上 */
export function useThemeSync() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])
}