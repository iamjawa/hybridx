interface TraitBarProps {
  label: string
  value: number
  max?: number
  color?: string
}

export function TraitBar({ label, value, max = 10, color = "bg-primary" }: TraitBarProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface TraitTextProps {
  label: string
  value: string
  color?: string
}

export function TraitText({ label, value, color }: TraitTextProps) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className={`text-sm font-medium ${color ?? ""}`}>{value}</p>
    </div>
  )
}

interface TraitBooleanProps {
  label: string
  value: boolean
}

export function TraitBoolean({ label, value }: TraitBooleanProps) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className={`text-sm font-medium ${value ? "text-emerald-500" : "text-muted-foreground"}`}>
        {value ? "Yes" : "No"}
      </p>
    </div>
  )
}
