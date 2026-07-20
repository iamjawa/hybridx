"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Leaf, GitMerge, Sprout, Flower2, Database, Star,
  CalendarClock, Eye, FlaskConical, TrendingUp,
  CheckCircle2, Timer, ListChecks,
} from "lucide-react"
import Link from "next/link"

function StatCard({ label, value, icon: Icon, href, sub, color }: { label: string; value: number | string; icon: any; href: string; sub?: string; color?: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-border/80 h-full">
        <CardContent className="flex items-center gap-4 p-6">
          <div className={`flex size-12 items-center justify-center rounded-xl ${color ?? "bg-primary/10"}`}>
            <Icon className={`size-6 ${color ? "text-white" : "text-primary"}`} />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/60">{sub}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function TimelineIcon({ type }: { type: string }) {
  const icons: Record<string, any> = {
    plant: { icon: Leaf, color: "text-emerald-500" },
    cross: { icon: GitMerge, color: "text-blue-500" },
    seed: { icon: Database, color: "text-amber-500" },
    selection: { icon: CheckCircle2, color: "text-purple-500" },
    evaluation: { icon: Star, color: "text-rose-500" },
  }
  const match = icons[type] ?? { icon: ListChecks, color: "text-muted-foreground" }
  const Icon = match.icon
  return (
    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
      <Icon className={`size-4 ${match.color}`} />
    </div>
  )
}

export function DashboardClient({ stats, analytics }: any) {
  const isNewUser = (stats.plantCount ?? 0) < 3
  const checklistProgress = Math.min(100, ((stats.plantCount >= 1 ? 1 : 0) + (stats.crossCount >= 1 ? 1 : 0) + (stats.speciesCount >= 1 ? 1 : 0) + ((stats.goalCount ?? 0) >= 1 ? 1 : 0)) * 25)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your breeding programme at a glance</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="size-4" />
          {new Date().getFullYear()} Season
        </div>
      </div>

      {isNewUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="font-semibold text-lg">Getting started</p>
              <p className="text-sm text-muted-foreground">Complete these steps to set up your breeding programme</p>
            </div>
            <div className="space-y-2">
              <ChecklistItem checked={(stats.plantCount ?? 0) >= 1} label="Add your first plant" href="/plants/new" />
              <ChecklistItem checked={(stats.crossCount ?? 0) >= 1} label="Create your first cross" href="/crosses/new" />
              <ChecklistItem checked={stats.speciesCount >= 1} label="Configure your species" href="/species" />
              <ChecklistItem checked={(stats.goalCount ?? 0) >= 1} label="Set a breeding goal" href="/goals" />
            </div>
            <Progress value={checklistProgress} className="h-1.5" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Crosses This Year" value={stats.thisYearCrosses} icon={GitMerge} href="/crosses" color="bg-blue-500/90" sub="planned + pollinated" />
        <StatCard label="Seeds Harvested" value={stats.thisYearSeeds} icon={Database} href="/seeds" color="bg-amber-500/90" sub="batches this season" />
        <StatCard label="Seedlings Growing" value={stats.thisYearSeedlings} icon={Sprout} href="/seedlings" color="bg-emerald-500/90" sub={stats.seedsStratifying > 0 ? `${stats.seedsStratifying} batches stratifying` : undefined} />
        <StatCard label="Evaluations" value={stats.evaluationCount} icon={Star} href="/evaluation" color="bg-rose-500/90" sub={`${stats.unevaluatedSeedlings} pending`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Breeding Performance
            </CardTitle>
            <CardDescription>Key metrics for your programme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selection Rate</span>
                  <span className="font-medium">{stats.selectionRate}%</span>
                </div>
                <Progress value={stats.selectionRate} className="h-2" />
                <p className="text-xs text-muted-foreground">{stats.potentialKeepers} seedlings selected as keepers</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Evaluation Progress</span>
                  <span className="font-medium">{stats.evalRate}%</span>
                </div>
                <Progress value={stats.evalRate} className="h-2" />
                <p className="text-xs text-muted-foreground">{stats.unevaluatedSeedlings} seedlings still need evaluation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="size-4 text-blue-500" />
              Stratification
            </CardTitle>
            <CardDescription>Seeds in cold/warm treatment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.seedsStratifying > 0 ? (
              <>
                <div>
                  <p className="text-3xl font-semibold">{stats.seedsStratifying}</p>
                  <p className="text-sm text-muted-foreground">batches currently stratifying</p>
                </div>
                {stats.stratificationsEndingSoon > 0 && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                    <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                      <Timer className="size-4" />
                      {stats.stratificationsEndingSoon} ending soon
                    </p>
                    <p className="text-xs text-amber-600/70 mt-1">Check stratification progress</p>
                  </div>
                )}
                <Link href="/seeds?stage=stratifying" className="text-sm text-primary hover:underline block">
                  View stratifying batches →
                </Link>
              </>
            ) : (
              <div className="text-center py-6">
                <FlaskConical className="mx-auto size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No seeds in stratification</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Timeline</CardTitle>
            <CardDescription>Recent breeding activity across your programme</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity?.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <ListChecks className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground/60">Activity appears as you add plants, crosses, and seeds</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-1">
                  {stats.recentActivity?.map((item: any, i: number) => (
                    <Link key={`${item.type}-${item.id}-${i}`} href={item.href} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <TimelineIcon type={item.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{item.type}</span>
                          {item.score != null && <Badge variant="outline" className="text-xs">{item.score}</Badge>}
                          {item.species && <span>{item.species}</span>}
                          {item.parentage && <span className="truncate">{item.parentage}</span>}
                          {item.count != null && <span>{item.count} seeds</span>}
                          <span className="ml-auto">{new Date(item.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="size-4 text-rose-500" />
                Need Attention
              </CardTitle>
              <CardDescription>Items requiring action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.unevaluatedSeedlings > 0 && (
                <Link href="/evaluation" className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 border border-amber-500/20 bg-amber-500/5">
                  <Star className="size-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">{stats.unevaluatedSeedlings} seedlings need evaluation</p>
                    <p className="text-xs text-muted-foreground">Evaluate them to track breeding progress</p>
                  </div>
                </Link>
              )}
              {stats.potentialKeepers > 0 && (
                <Link href="/seedlings?disposition=SELECTED" className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 border border-purple-500/20 bg-purple-500/5">
                  <CheckCircle2 className="size-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">{stats.potentialKeepers} selected seedlings</p>
                    <p className="text-xs text-muted-foreground">Review for advancement to breeding stock</p>
                  </div>
                </Link>
              )}
              {stats.stratificationsEndingSoon > 0 && (
                <Link href="/seeds?stage=STRATIFYING" className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 border border-blue-500/20 bg-blue-500/5">
                  <Timer className="size-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{stats.stratificationsEndingSoon} stratifications ending</p>
                    <p className="text-xs text-muted-foreground">Prepare for germination recording</p>
                  </div>
                </Link>
              )}
              {stats.unevaluatedSeedlings === 0 && stats.potentialKeepers === 0 && stats.stratificationsEndingSoon === 0 && (
                <div className="text-center py-6">
                  <CheckCircle2 className="mx-auto size-8 text-emerald-500/40" />
                  <p className="mt-2 text-sm text-muted-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground/60">No items need attention</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flower2 className="size-4 text-primary" />
                Collection Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/plants" className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-xl font-semibold">{stats.plantCount}</p>
                  <p className="text-xs text-muted-foreground">Plants</p>
                </Link>
                <Link href="/crosses" className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-xl font-semibold">{stats.crossCount}</p>
                  <p className="text-xs text-muted-foreground">Crosses</p>
                </Link>
                <Link href="/seeds" className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-xl font-semibold">{stats.seedCount}</p>
                  <p className="text-xs text-muted-foreground">Seed Batches</p>
                </Link>
                <Link href="/seedlings" className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-xl font-semibold">{stats.seedlingCount}</p>
                  <p className="text-xs text-muted-foreground">Seedlings</p>
                </Link>
                <Link href="/species" className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-xl font-semibold">{stats.speciesCount}</p>
                  <p className="text-xs text-muted-foreground">Species</p>
                </Link>
                <Link href="/evaluation" className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-xl font-semibold">{stats.evaluationCount}</p>
                  <p className="text-xs text-muted-foreground">Evaluations</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {analytics && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Crosses by Month ({new Date().getFullYear()})</CardTitle>
              <CardDescription>Number of crosses created each month</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.months?.length > 0 ? (
                <div className="h-48">
                  <div className="flex items-end gap-2 h-40">
                    {analytics.months.map((m: any) => {
                      const max = Math.max(...analytics.months.map((x: any) => x.count), 1)
                      const height = (m.count / max) * 100
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground">{m.count}</span>
                          <div
                            className="w-full rounded-t bg-primary/60 hover:bg-primary/80 transition-colors"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">{m.month}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No crosses this year</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seedling Disposition</CardTitle>
              <CardDescription>Current status of all seedlings</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.dispositions?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.dispositions.map((d: any) => {
                    const total = analytics.dispositions.reduce((s: number, x: any) => s + x.count, 0)
                    const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
                    return (
                      <div key={d.disposition} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{d.disposition}</span>
                          <span className="font-medium">{d.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No seedlings yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evaluation Overview</CardTitle>
              <CardDescription>Score distribution</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <p className="text-4xl font-semibold">{analytics.avgScore ?? "—"}</p>
              <p className="text-sm text-muted-foreground mt-1">Average score</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{analytics.scoreCount} evaluations recorded</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Top Breeding Parents</CardTitle>
              <CardDescription>Plants used in the most crosses</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topParents?.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topParents.map((p: any, i: number) => (
                    <Link key={p.id} href={`/plants/${p.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{i + 1}</span>
                      <span className="text-sm font-medium flex-1">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p._count.crossesAsSeedParent + p._count.crossesAsPollenParent} crosses</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No crosses yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ checked, label, href }: { checked: boolean; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <div className={`flex size-6 items-center justify-center rounded-full border ${checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30"}`}>
        {checked ? <CheckCircle2 className="size-3.5" /> : <span className="size-2 rounded-full bg-muted-foreground/30" />}
      </div>
      <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>{label}</span>
      {!checked && <CheckCircle2 className="size-3.5 ml-auto text-muted-foreground/40" />}
    </Link>
  )
}
