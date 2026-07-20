"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Leaf, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { getPlants, createPlant, deletePlant } from "@/server/actions/plants"
import { useRouter } from "next/navigation"

export function PlantsClient({ initialPlants, total, pages, species }: any) {
  const router = useRouter()
  const [plants, setPlants] = useState(initialPlants)
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", speciesId: "", description: "", origin: "", year: "" })

  async function handleSearch(query: string) {
    setSearch(query)
    const result = await getPlants({ search: query, speciesId: speciesFilter || undefined })
    setPlants(result.plants)
  }

  async function handleSpeciesFilter(value: string | null) {
    setSpeciesFilter(value ?? "")
    const result = await getPlants({ speciesId: value || undefined, search: search || undefined })
    setPlants(result.plants)
  }

  async function handleCreate() {
    await createPlant({
      name: form.name,
      speciesId: form.speciesId || undefined,
      description: form.description || undefined,
      origin: form.origin || undefined,
      year: form.year ? parseInt(form.year) : undefined,
    })
    setOpen(false)
    setForm({ name: "", speciesId: "", description: "", origin: "", year: "" })
    const result = await getPlants({ search: search || undefined, speciesId: speciesFilter || undefined })
    setPlants(result.plants)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await deletePlant(id)
    const result = await getPlants({ search: search || undefined, speciesId: speciesFilter || undefined })
    setPlants(result.plants)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plants</h1>
          <p className="text-sm text-muted-foreground">{total} plants in your collection</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 size-4" />
            Add Plant
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Plant</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleCreate()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Select value={form.speciesId} onValueChange={(v) => setForm({ ...form, speciesId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>
                    {species.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
              <Button type="submit" className="w-full">Create Plant</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={speciesFilter} onValueChange={handleSpeciesFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All species" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {species.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Leaf className="size-12 text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-lg font-medium">No plants found</p>
              <p className="text-sm text-muted-foreground">Add your first plant to start tracking your collection.</p>
            </div>
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                <Plus className="mr-2 size-4" />Add Plant
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Plant</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-empty">Name *</Label>
                    <Input id="name-empty" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full">Create Plant</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant: any) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <Card className="h-full transition-colors hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{plant.name}</h3>
                      {plant.varietyName && (
                        <p className="text-sm text-muted-foreground truncate">{plant.varietyName}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(plant.id)
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plant.species && <Badge variant="secondary">{plant.species.name}</Badge>}
                    {plant.status && <Badge variant="outline">{plant.status}</Badge>}
                    {plant.year && <Badge variant="outline">{plant.year}</Badge>}
                  </div>
                  {plant.colour && <p className="mt-2 text-xs text-muted-foreground">Colour: {plant.colour}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
