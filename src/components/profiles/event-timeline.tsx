import { Clock } from "lucide-react"

interface TimelineEvent {
  date: Date
  label: string
  type?: string
}

interface EventTimelineProps {
  events: TimelineEvent[]
  emptyMessage?: string
}

export function EventTimeline({ events, emptyMessage = "No events recorded" }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto size-6 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const year = event.date.getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearEvents]) => (
        <div key={year}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{year}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {yearEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3 pl-1">
                <div className="mt-1.5 size-2 rounded-full bg-muted-foreground/30 shrink-0" />
                <div>
                  <p className="text-sm">{event.label}</p>
                  <p className="text-xs text-muted-foreground/60">{event.date.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
