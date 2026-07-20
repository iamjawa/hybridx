import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
}

export function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground/60">{sub}</p>}
    </div>
  )
}

interface StatGridProps {
  children: React.ReactNode
}

export function StatGrid({ children }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {children}
    </div>
  )
}
