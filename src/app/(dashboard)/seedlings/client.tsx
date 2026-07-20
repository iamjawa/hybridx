"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sprout, Heart, Search } from "lucide-react"
import Link from "next/link"
import { getSeedlings, toggleFavourite, setDisposition } from "@/server/actions/seedlings"
import { useRouter } from "next/navigation"

export function SeedlingsClient({ initialSeedlings, total, pages, species }: any) {
  const router = useRouter()
  const [seedlings, setSeedlings] = useState(initialSeedlings)
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("")
  const [dispositionFilter, setDispositionFilter] = useState("")

  async function handleSearch(query: string) {
    setSearch(query)
    const result = await getSeedlings({ search: query, speciesId: speciesFilter || undefined, disposition: dispositionFilter || undefined })
    setSeedlings(result.seedlings)
  }

  async function filter() {
    const result = await getSeedlings({ speciesId: speciesFilter || undefined, disposition: dispositionFilter || undefined, search: search || undefined })
    setSeedlings(result.seedlings)
  }

  async function handleToggleFavourite(id: string) {
    await toggleFavourite(id)
    filter()
  }

  async function handleDisposition(id: string, disposition: string) {
    await setDisposition(id, disposition)
    filter()
  }

  const dispositionColors: Record<string, string> = {
    SELECTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    KEPT: "border-blue-500/30 bg-blue-500/10 text-blue-500",
    CULLED: "border-red-500/30 bg-red-500/10 text-red-500",
    SOLD: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    GIFTED: "border-purple-500/30 bg-purple-500/10 text-purple-500",
    DEAD: "border-neutral-500/30 bg-neutral-500/10 text-neutral-500",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seedlings</h1>
          <p className="text-sm text-muted-foreground">{total} seedlings tracked</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by seedling ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={speciesFilter} onValueChange={(v) => { setSpeciesFilter(v ?? ""); setTimeout(filter, 0) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Species" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {species.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={dispositionFilter} onValueChange={(v) => { setDispositionFilter(v ?? ""); setTimeout(filter, 0) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Disposition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="SELECTED">Selected</SelectItem>
            <SelectItem value="KEPT">Kept</SelectItem>
            <SelectItem value="CULLED">Culled</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="GIFTED">Gifted</SelectItem>
            <SelectItem value="DEAD">Dead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {seedlings.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-4 py-16">
          <Sprout className="size-12 text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-lg font-medium">No seedlings found</p>
            <p className="text-sm text-muted-foreground">Seedlings appear here when you harvest seeds from crosses.</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seedlings.map((s: any) => (
            <Link key={s.id} href={`/seedlings/${s.id}`}>
              <Card className="h-full transition-colors hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{s.seedlingId}</h3>
                      <p className="text-sm text-muted-foreground">
                        {s.cross?.seedParent?.name ?? "?"} × {s.cross?.pollenParent?.name ?? "?"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-8 shrink-0 ${s.isFavourite ? "text-red-500" : "text-muted-foreground"}`}
                      onClick={(e) => { e.preventDefault(); handleToggleFavourite(s.id) }}
                    >
                      <Heart className={`size-4 ${s.isFavourite ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.species && <Badge variant="secondary">{s.species.name}</Badge>}
                    <Badge variant="outline">Year {s.year}</Badge>
                    {s.disposition && (
                      <Badge className={dispositionColors[s.disposition] || ""} variant="outline">
                        {s.disposition}
                      </Badge>
                    )}
                    {s.evaluations?.[0]?.totalScore != null && (
                      <Badge variant="outline">{s.evaluations[0].totalScore}/10</Badge>
                    )}
                  </div>
                  {s.generation && <p className="mt-2 text-xs text-muted-foreground">Gen: {s.generation}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
