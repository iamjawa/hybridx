import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16">
        <Icon className="size-12 text-muted-foreground/40" />
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  )
}
