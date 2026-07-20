"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Leaf, GitMerge, Sprout, Flower2, CalendarClock, TrendingUp, Crosshair, Eye } from "lucide-react"
import Link from "next/link"

type Stats = {
  plantCount: number
  crossCount: number
  seedlingCount: number
  speciesCount: number
  thisYearSeedlings: number
  germinationRate: number
  recentPlants: any[]
  recentCrosses: any[]
  recentSeedlings: any[]
  upcomingTasks: any[]
}

function StatCard({ label, value, icon: Icon, href, sub }: { label: string; value: number | string; icon: any; href: string; sub?: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-border/80">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-6 text-primary" />
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

export function DashboardClient({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your breeding programme</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Plants" value={stats.plantCount} icon={Leaf} href="/plants" />
        <StatCard label="Crosses" value={stats.crossCount} icon={GitMerge} href="/crosses" />
        <StatCard label="Seedlings" value={stats.seedlingCount} icon={Sprout} href="/seedlings" sub={`${stats.thisYearSeedlings} this year`} />
        <StatCard label="Species" value={stats.speciesCount} icon={Flower2} href="/species" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Plants</CardTitle>
            <CardDescription>Latest additions to your collection</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentPlants.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Leaf className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No plants yet</p>
                <Link href="/plants/new" className="text-sm font-medium text-primary hover:underline">
                  Add your first plant
                </Link>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {stats.recentPlants.map((plant: any) => (
                    <Link key={plant.id} href={`/plants/${plant.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Leaf className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{plant.name}</p>
                        <p className="text-xs text-muted-foreground">{plant.species?.name ?? "Unknown species"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Crosses</CardTitle>
            <CardDescription>Latest planned and executed crosses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCrosses.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <GitMerge className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No crosses yet</p>
                <Link href="/crosses/new" className="text-sm font-medium text-primary hover:underline">
                  Plan your first cross
                </Link>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {stats.recentCrosses.map((cross: any) => (
                    <Link key={cross.id} href={`/crosses/${cross.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Crosshair className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {cross.seedParent?.name ?? "?"} × {cross.pollenParent?.name ?? "?"}
                        </p>
                        <p className="text-xs text-muted-foreground">{cross.crossNumber ?? "No number"}</p>
                      </div>
                      {cross.pollinationDate && <Badge variant="secondary" className="shrink-0">Pollinated</Badge>}
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Seedlings</CardTitle>
            <CardDescription>Latest seedlings from your crosses</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentSeedlings.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Sprout className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No seedlings yet</p>
                <Link href="/seedlings/new" className="text-sm font-medium text-primary hover:underline">
                  Add your first seedling
                </Link>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {stats.recentSeedlings.map((s: any) => (
                    <Link key={s.id} href={`/seedlings/${s.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Eye className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.seedlingId}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.cross?.seedParent?.name ?? "?"} × {s.cross?.pollenParent?.name ?? "?"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CalendarClock className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                <p className="text-xs text-muted-foreground/60">Tasks will appear here when created</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {stats.upcomingTasks.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg p-2">
                      <div className="flex size-2 shrink-0 rounded-full bg-primary/60" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
