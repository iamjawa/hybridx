"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Leaf, GitMerge, Sprout, MapPin, Calendar, Award, Activity } from "lucide-react"
import Link from "next/link"

export function PlantDetailClient({ plant }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Leaf className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{plant.name}</h1>
            {plant.status && <Badge>{plant.status}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {plant.species?.name}{plant.year ? ` · ${plant.year}` : ""}{plant.origin ? ` · ${plant.origin}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Calendar className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Year</p><p className="text-sm font-medium">{plant.year ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <MapPin className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Origin</p><p className="text-sm font-medium">{plant.origin ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Activity className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Status</p><p className="text-sm font-medium">{plant.status}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Award className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Awards</p><p className="text-sm font-medium">{(plant.awards as any[])?.length ?? 0}</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="crosses">Crosses</TabsTrigger>
          <TabsTrigger value="seedlings">Seedlings</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-4">
          {plant.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{plant.description}</p></CardContent>
            </Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {plant.colour && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Colour</p><p className="text-sm font-medium">{plant.colour}</p></CardContent></Card>}
            {plant.fragrance && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Fragrance</p><p className="text-sm font-medium">{plant.fragrance}</p></CardContent></Card>}
            {plant.diseaseResistance && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Disease Resistance</p><p className="text-sm font-medium">{plant.diseaseResistance}</p></CardContent></Card>}
            {plant.pollenFertility != null && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pollen Fertility</p><p className="text-sm font-medium">{plant.pollenFertility}%</p></CardContent></Card>}
            {plant.seedFertility != null && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Seed Fertility</p><p className="text-sm font-medium">{plant.seedFertility}%</p></CardContent></Card>}
            {plant.repeatFlowering != null && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Repeat Flowering</p><p className="text-sm font-medium">{plant.repeatFlowering ? "Yes" : "No"}</p></CardContent></Card>}
            {plant.location && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{plant.location.name}</p></CardContent></Card>}
          </div>
        </TabsContent>

        <TabsContent value="crosses" className="mt-6">
          {plant.crossesAsSeedParent?.length === 0 && plant.crossesAsPollenParent?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No crosses recorded</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {plant.crossesAsSeedParent?.length > 0 && (
                <div><h3 className="mb-3 text-sm font-medium">As Seed Parent</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {plant.crossesAsSeedParent.map((cross: any) => (
                    <Link key={cross.id} href={`/crosses/${cross.id}`}>
                      <Card className="transition-colors hover:border-border/80">
                        <CardContent className="flex items-center gap-3 p-4">
                          <GitMerge className="size-4 text-muted-foreground" />
                          <div><p className="text-sm font-medium">{cross.pollenParent?.name ?? "?"} × {plant.name}</p>
                          <p className="text-xs text-muted-foreground">{cross.crossNumber ?? "No number"}</p></div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div></div>
              )}
              {plant.crossesAsPollenParent?.length > 0 && (
                <div><h3 className="mb-3 text-sm font-medium">As Pollen Parent</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {plant.crossesAsPollenParent.map((cross: any) => (
                    <Link key={cross.id} href={`/crosses/${cross.id}`}>
                      <Card className="transition-colors hover:border-border/80">
                        <CardContent className="flex items-center gap-3 p-4">
                          <GitMerge className="size-4 text-muted-foreground" />
                          <div><p className="text-sm font-medium">{plant.name} × {cross.seedParent?.name ?? "?"}</p>
                          <p className="text-xs text-muted-foreground">{cross.crossNumber ?? "No number"}</p></div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div></div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="seedlings" className="mt-6">
          {plant.seedlingsFrom?.length === 0 && plant.seedlingCrosses?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No seedlings recorded</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {[...(plant.seedlingsFrom ?? []), ...(plant.seedlingCrosses ?? [])].map((s: any) => (
                <Link key={s.id} href={`/seedlings/${s.id}`}>
                  <Card className="transition-colors hover:border-border/80">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Sprout className="size-4 text-muted-foreground" />
                      <div><p className="text-sm font-medium">{s.seedlingId}</p>
                      <p className="text-xs text-muted-foreground">Year {s.year}</p></div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="traits" className="mt-6">
          {plant.traitValues?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No traits recorded</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {plant.traitValues.map((tv: any) => (
                <Card key={tv.id}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{tv.trait?.name ?? "Unknown trait"}</p>
                    <p className="text-sm font-medium mt-1">{String(tv.value)}</p>
                    {tv.note && <p className="text-xs text-muted-foreground/60 mt-1">{tv.note}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          {plant.tasks?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No tasks</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {plant.tasks.map((task: any) => (
                <Card key={task.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`size-2 shrink-0 rounded-full ${task.completed ? "bg-green-500" : "bg-amber-500"}`} />
                    <div><p className="text-sm font-medium">{task.title}</p>
                    {task.dueDate && <p className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString()}</p>}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
