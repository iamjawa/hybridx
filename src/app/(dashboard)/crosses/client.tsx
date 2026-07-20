"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitMerge, Plus, Search, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"
import { getCrosses, createCross } from "@/server/actions/crosses"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PaginationBar } from "@/components/ui/pagination-bar"

export function CrossesClient({ initialCrosses, total, pages, species, plants }: any) {
  const router = useRouter()
  const [crosses, setCrosses] = useState(initialCrosses)
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ speciesId: "", seedParentId: "", pollenParentId: "", crossNumber: "", method: "MANUAL", notes: "", plannedDate: "" })
  const [saving, setSaving] = useState(false)

  async function handleSearch(query: string) {
    setSearch(query)
    const result = await getCrosses({ search: query, speciesId: speciesFilter || undefined })
    setCrosses(result.crosses)
  }

  async function handleSpeciesFilter(value: string | null) {
    setSpeciesFilter(value ?? "")
    const result = await getCrosses({ speciesId: value || undefined, search: search || undefined })
    setCrosses(result.crosses)
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const result = await createCross({
        speciesId: form.speciesId || undefined,
        seedParentId: form.seedParentId || undefined,
        pollenParentId: form.pollenParentId || undefined,
        crossNumber: form.crossNumber || undefined,
        method: form.method,
        notes: form.notes || undefined,
        plannedDate: form.plannedDate ? new Date(form.plannedDate) : undefined,
      })
      if (!result.success) { toast.error(result.error); return }
      toast.success("Cross created")
      setOpen(false)
      setForm({ speciesId: "", seedParentId: "", pollenParentId: "", crossNumber: "", method: "MANUAL", notes: "", plannedDate: "" })
      const crossesResult = await getCrosses()
      setCrosses(crossesResult.crosses)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handlePageChange(newPage: number) {
    setPage(newPage)
    const result = await getCrosses({ search: search || undefined, speciesId: speciesFilter || undefined, page: newPage })
    setCrosses(result.crosses)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Crosses</h1>
          <p className="text-sm text-muted-foreground">{total} crosses recorded</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 size-4" />
            New Cross
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Plan a New Cross</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
              <div className="space-y-2">
                <Label>Species</Label>
                <Select value={form.speciesId} onValueChange={(v) => setForm({ ...form, speciesId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select species">{species.find((s: any) => s.id === form.speciesId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {species.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Seed Parent (♀)</Label>
                <Select value={form.seedParentId} onValueChange={(v) => setForm({ ...form, seedParentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select seed parent">{plants.find((p: any) => p.id === form.seedParentId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {plants.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pollen Parent (♂)</Label>
                <Select value={form.pollenParentId} onValueChange={(v) => setForm({ ...form, pollenParentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select pollen parent">{plants.find((p: any) => p.id === form.pollenParentId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {plants.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crossNumber">Cross Number</Label>
                <Input id="crossNumber" value={form.crossNumber} onChange={(e) => setForm({ ...form, crossNumber: e.target.value })} placeholder="e.g. 2024-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedDate">Planned Date</Label>
                <Input id="plannedDate" type="date" value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v ?? "MANUAL" })}>
                  <SelectTrigger><SelectValue>{["MANUAL", "OPEN", "BAG", "CAGE", "ISOLATION"].find(v => v === form.method)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="BAG">Bag</SelectItem>
                    <SelectItem value="CAGE">Cage</SelectItem>
                    <SelectItem value="ISOLATION">Isolation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Create Cross"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search crosses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && (setSearch(""), handleSearch(""), e.currentTarget.blur())}
            className="pl-9"
          />
        </div>
        <Select value={speciesFilter} onValueChange={handleSpeciesFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All species">{species.find((s: any) => s.id === speciesFilter)?.name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {species.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {crosses.length === 0 ? (
        <EmptyState
          icon={GitMerge}
          title="No crosses yet"
          description="Plan your first cross by selecting two parent plants. Crosses are the foundation of every breeding programme."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" />Plan Your First Cross</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crosses.map((cross: any) => (
            <Link key={cross.id} href={`/crosses/${cross.id}`}>
              <Card className="h-full transition-colors hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {cross.seedParent?.name ?? "?"} <span className="text-muted-foreground">×</span> {cross.pollenParent?.name ?? "?"}
                      </p>
                      {cross.crossNumber && (
                        <p className="text-sm text-muted-foreground">{cross.crossNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cross.species && <Badge variant="secondary">{cross.species.name}</Badge>}
                    {cross.pollinationDate ? <Badge variant="outline">Pollinated</Badge> : <Badge variant="outline">Planned</Badge>}
                    <Badge variant="outline">{cross.seedlings?.length ?? 0} seedlings</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <PaginationBar page={page} pages={pages} total={total} onPageChange={handlePageChange} />
    </div>
  )
}
