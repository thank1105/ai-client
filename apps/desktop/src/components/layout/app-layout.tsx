import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}