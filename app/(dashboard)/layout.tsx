import { Sidebar } from '@/components/layout/sidebar'
import { ChatWidget } from '@/components/chat/ChatWidget'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-[1400px] mx-auto p-8">
          {children}
        </div>
      </main>
      <ChatWidget />
    </div>
  )
}
