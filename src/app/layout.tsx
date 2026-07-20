import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar-nav"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "HybridX — The operating system for plant breeders",
  description: "Complete breeding platform for managing every stage of a breeding programme",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
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
        </Providers>
      </body>
    </html>
  )
}
