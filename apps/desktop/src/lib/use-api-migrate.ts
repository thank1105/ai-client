import { useEffect } from 'react'
import { useAppStore } from '@/stores/app-store'

/** 启动时迁移：
 *  - 如果旧 baseURL 是 /llm 相对路径，改回真实 https 地址
 *  - 如果是 http(s) 完整 URL，保持不动（llm.ts 会自动决定走代理还是直连）
 */
export function useApiMigrate() {
  useEffect(() => {
    const apiConfig = useAppStore.getState().apiConfig
    if (apiConfig.baseURL === '/llm') {
      useAppStore.getState().setApiConfig({
        baseURL: 'https://api.minimaxi.com/anthropic',
      })
    }
  }, [])
}
