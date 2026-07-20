import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <div className="flex h-full flex-col">
          <header className="flex h-14 items-center gap-4 border-b px-6">
            <SidebarTrigger />
          </header>
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
