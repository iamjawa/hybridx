"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sprout, Heart, Ruler, Eye, Activity, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleFavourite, setDisposition } from "@/server/actions/seedlings"

export function SeedlingDetailClient({ seedling }: any) {
  const router = useRouter()

  async function handleFavourite() {
    await toggleFavourite(seedling.id)
    router.refresh()
  }

  async function handleDisposition(disposition: string) {
    await setDisposition(seedling.id, disposition)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Sprout className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{seedling.seedlingId}</h1>
            {seedling.disposition && <Badge>{seedling.disposition}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            Year {seedling.year}{seedling.generation ? ` · ${seedling.generation}` : ""}{seedling.species ? ` · ${seedling.species.name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFavourite}>
            <Heart className={`mr-2 size-4 ${seedling.isFavourite ? "fill-red-500 text-red-500" : ""}`} />
            {seedling.isFavourite ? "Favourited" : "Favourite"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Ruler className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Bloom Size</p><p className="text-sm font-medium">{seedling.bloomSize ? `${seedling.bloomSize}cm` : "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Activity className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Health</p><p className="text-sm font-medium">{seedling.health != null ? `${seedling.health}/10` : "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Eye className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Disease Resistance</p><p className="text-sm font-medium">{seedling.diseaseResistance != null ? `${seedling.diseaseResistance}/10` : "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Star className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Petal Count</p><p className="text-sm font-medium">{seedling.petalCount ?? "—"}</p></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-4">
        {seedling.cross?.seedParent && (
          <Card className="flex-1"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Seed Parent</p>
            <Link href={`/plants/${seedling.cross.seedParent.id}`} className="mt-1 block text-sm font-medium hover:text-primary">
              {seedling.cross.seedParent.name}
            </Link>
          </CardContent></Card>
        )}
        {seedling.cross?.pollenParent && (
          <Card className="flex-1"><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pollen Parent</p>
            <Link href={`/plants/${seedling.cross.pollenParent.id}`} className="mt-1 block text-sm font-medium hover:text-primary">
              {seedling.cross.pollenParent.name}
            </Link>
          </CardContent></Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {["SELECTED", "KEPT", "CULLED", "SOLD", "GIFTED", "DEAD"].map((d) => (
          <Button
            key={d}
            variant={seedling.disposition === d ? "default" : "outline"}
            size="sm"
            onClick={() => handleDisposition(d)}
          >
            {d}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-4">
          {seedling.colour && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Colour</p><p className="mt-1 text-sm font-medium">{seedling.colour}</p></CardContent></Card>}
          {seedling.fragrance && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Fragrance</p><p className="mt-1 text-sm font-medium">{seedling.fragrance}</p></CardContent></Card>}
          {seedling.growthNotes && <Card><CardHeader><CardTitle className="text-base">Growth Notes</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{seedling.growthNotes}</p></CardContent></Card>}
          {seedling.flowerNotes && <Card><CardHeader><CardTitle className="text-base">Flower Notes</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{seedling.flowerNotes}</p></CardContent></Card>}
        </TabsContent>

        <TabsContent value="evaluations" className="mt-6">
          {seedling.evaluations?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No evaluations yet</CardContent></Card>
          ) : (
            <div className="space-y-4">
              {seedling.evaluations.map((e: any) => (
                <Card key={e.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-medium">{e.systemName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p></div>
                      {e.totalScore != null && (
                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-lg font-semibold">{e.totalScore}</span>
                        </div>
                      )}
                    </div>
                    {e.notes && <p className="mt-2 text-sm text-muted-foreground">{e.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="traits" className="mt-6">
          {seedling.traitValues?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No trait values recorded</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seedling.traitValues.map((tv: any) => (
                <Card key={tv.id}><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{tv.trait?.name}</p>
                  <p className="mt-1 text-sm font-medium">{String(tv.value)}</p>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">
            Notes feature coming soon
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
