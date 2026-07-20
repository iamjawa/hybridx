"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Activity, Database, Shield, BarChart3, MessageSquareText, TrendingUp } from "lucide-react"

function StatusBadge({ status }: { status: "ok" | "error" }) {
  return status === "ok"
    ? <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500" variant="outline"><CheckCircle2 className="size-3 mr-1" />OK</Badge>
    : <Badge className="border-red-500/30 bg-red-500/10 text-red-500" variant="outline"><XCircle className="size-3 mr-1" />ERROR</Badge>
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value < 0 ? "—" : value}</p>
    </div>
  )
}

export function HealthClient({ db, auth, counts, feedbackCount, eventCount, latestFeedback, latestEvents }: any) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground">Beta operations dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Database className="size-4" />Database</CardTitle></CardHeader>
          <CardContent><div className="flex items-center justify-between"><StatusBadge status={db.status} />{db.message && <span className="text-xs text-red-500 ml-2">{db.message}</span>}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="size-4" />Authentication</CardTitle></CardHeader>
          <CardContent><div className="flex items-center justify-between"><StatusBadge status={auth.status} />{auth.message && <span className="text-xs text-red-500 ml-2">{auth.message}</span>}</div></CardContent>
        </Card>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><BarChart3 className="size-4" />Data Summary</p>
        <div className="grid grid-cols-4 gap-3">
          <StatCard icon={Database} label="Plants" value={counts.plantCount} />
          <StatCard icon={Activity} label="Crosses" value={counts.crossCount} />
          <StatCard icon={BarChart3} label="Seedlings" value={counts.seedlingCount} />
          <StatCard icon={BarChart3} label="Seeds" value={counts.seedCount} />
          <StatCard icon={BarChart3} label="Evaluations" value={counts.evaluationCount} />
          <StatCard icon={TrendingUp} label="Goals" value={counts.goalCount} />
          <StatCard icon={MessageSquareText} label="Feedback" value={feedbackCount} />
          <StatCard icon={Activity} label="Events" value={eventCount} />
        </div>
      </div>

      {latestFeedback.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquareText className="size-4" />Latest Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {latestFeedback.map((f: any) => (
              <div key={f.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-muted-foreground">{f.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {latestEvents.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="size-4" />Recent Events</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {latestEvents.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between text-sm py-1">
                <span className="font-mono text-xs">{e.event}</span>
                <span className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
