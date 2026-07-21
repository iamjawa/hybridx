"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Database, Plus, Search, Calendar, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { getSeeds, createSeed, advanceSeedStage, deleteSeed } from "@/server/actions/seeds"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PaginationBar } from "@/components/ui/pagination-bar"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SEED_STAGE_LABELS } from "@/lib/constants"

const stageOrder = ["HARVESTED", "CLEANED", "STORED", "STRATIFYING", "COLD_STRATIFYING", "WARM_STRATIFYING", "GERMINATING", "GERMINATED", "FAILED"]

export function SeedsClient({ initialSeeds, total, pages, species, initialStage = "", initialSearch = "" }: any) {
  const router = useRouter()
  const [seeds, setSeeds] = useState(initialSeeds)
  const [search, setSearch] = useState(initialSearch)
  const [stageFilter, setStageFilter] = useState(initialStage)
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ batchNumber: "", crossId: "", speciesId: "", totalCount: "", notes: "", harvestDate: "", viableCount: "", storageCondition: "" })
  const [saving, setSaving] = useState(false)

  function updateUrl(params: Record<string, string>) {
    const sp = new URLSearchParams()
    if (params.search || search) sp.set("search", params.search ?? search)
    if (params.stage || stageFilter) sp.set("stage", params.stage ?? stageFilter)
    router.replace(`/seeds${sp.toString() ? `?${sp.toString()}` : ""}`)
  }

  async function handleSearch(query: string) {
    setSearch(query)
    const result = await getSeeds({ search: query, stage: stageFilter || undefined })
    setSeeds(result.seeds)
    updateUrl({ search: query })
  }

  async function handleStageFilter(value: string | null) {
    const v = value === "all" ? undefined : value
    setStageFilter(v ?? "")
    const result = await getSeeds({ stage: v || undefined, search: search || undefined })
    setSeeds(result.seeds)
    updateUrl({ stage: value ?? "" })
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const result = await createSeed({
        batchNumber: form.batchNumber || undefined,
        speciesId: form.speciesId || undefined,
        totalCount: form.totalCount ? parseInt(form.totalCount) : 0,
        harvestDate: form.harvestDate ? new Date(form.harvestDate) : undefined,
        viableCount: form.viableCount ? parseInt(form.viableCount) : undefined,
        storageCondition: form.storageCondition || undefined,
        notes: form.notes || undefined,
      })
      if (!result.success) { toast.error(result.error); return }
      toast.success("Seed batch created")
      setOpen(false)
      setForm({ batchNumber: "", crossId: "", speciesId: "", totalCount: "", notes: "", harvestDate: "", viableCount: "", storageCondition: "" })
      const seedsResult = await getSeeds()
      setSeeds(seedsResult.seeds)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handlePageChange(newPage: number) {
    setPage(newPage)
    const result = await getSeeds({ search: search || undefined, stage: stageFilter || undefined, page: newPage })
    setSeeds(result.seeds)
  }

  async function handleDelete(id: string) {
    const result = await deleteSeed(id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Seed batch deleted")
    const seedsResult = await getSeeds({ search: search || undefined, stage: stageFilter || undefined })
    setSeeds(seedsResult.seeds)
    router.refresh()
  }

  async function handleAdvance(id: string, stage: string) {
    const result = await advanceSeedStage(id, stage)
    if (!result.success) { toast.error(result.error); return }
    toast.success(`Stage updated to ${SEED_STAGE_LABELS[stage] ?? stage}`)
    const seedsResult = await getSeeds({ search: search || undefined, stage: stageFilter || undefined })
    setSeeds(seedsResult.seeds)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seeds</h1>
          <p className="text-sm text-muted-foreground">{total} seed batches</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 size-4" />
            New Seed Batch
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Seed Batch</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch Number</Label>
                <Input id="batch" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} placeholder="e.g. 2024-B-001" />
              </div>
              <div className="space-y-2">
                <Label>Species</Label>
                <Select value={form.speciesId} onValueChange={(v) => setForm({ ...form, speciesId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select species">{species.find((s: any) => s.id === form.speciesId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {species.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Total Seeds</Label>
                <Input id="count" type="number" value={form.totalCount} onChange={(e) => setForm({ ...form, totalCount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date</Label>
                <Input id="harvestDate" type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="viableCount">Viable Count</Label>
                <Input id="viableCount" type="number" value={form.viableCount} onChange={(e) => setForm({ ...form, viableCount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageCondition">Storage Condition</Label>
                <Input id="storageCondition" value={form.storageCondition} onChange={(e) => setForm({ ...form, storageCondition: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Create Batch"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search seed batches..." value={search} onChange={(e) => handleSearch(e.target.value)} onKeyDown={(e) => e.key === "Escape" && (setSearch(""), handleSearch(""), e.currentTarget.blur())} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={handleStageFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All stages">{stageFilter && stageFilter !== "all" ? (SEED_STAGE_LABELS[stageFilter] ?? stageFilter) : undefined}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stageOrder.map((s) => (
              <SelectItem key={s} value={s}>{SEED_STAGE_LABELS[s] ?? s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {seeds.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No seed batches"
          description="Record your first seed harvest from a cross. Seed batches track the full journey from harvest through stratification to germination."
          action={<Button onClick={() => setOpen(true)} variant="outline"><Plus className="mr-2 size-4" />Record Seed Batch</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seeds.map((seed: any) => {
            const stage = seed.stage as string
            const stratDate = seed.stratificationStart ? new Date(seed.stratificationStart) : null
            return (
              <Link key={seed.id} href={`/seeds/${seed.id}`}>
                <Card className="h-full transition-colors hover:border-border/80">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{seed.batchNumber ?? "Unnamed batch"}</p>
                        <p className="text-sm text-muted-foreground">{seed.totalCount} seeds</p>
                      </div>
                      <ConfirmDialog
                        title="Delete seed batch?"
                        description={`This will permanently delete this seed batch and all associated data. This action cannot be undone.`}
                        onConfirm={() => handleDelete(seed.id)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </ConfirmDialog>
                      <Badge className={
                        stage === "GERMINATED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
                        stage === "FAILED" ? "border-red-500/30 bg-red-500/10 text-red-500" :
                        stage === "STRATIFYING" || stage === "COLD_STRATIFYING" || stage === "WARM_STRATIFYING" ? "border-blue-500/30 bg-blue-500/10 text-blue-500" :
                        "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      } variant="outline">{SEED_STAGE_LABELS[stage] ?? stage}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {seed.species && <Badge variant="secondary">{seed.species.name}</Badge>}
                      {seed.viableCount != null && <Badge variant="outline">{seed.viableCount} viable</Badge>}
                      {seed.germinatedCount != null && <Badge variant="outline">{seed.germinatedCount} germinated</Badge>}
                      <Badge variant="outline">{seed.seedlings?.length ?? 0} seedlings</Badge>
                    </div>
                    {stratDate && (
                      <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        Stratification started {stratDate.toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
      <PaginationBar page={page} pages={pages} total={total} onPageChange={handlePageChange} />
    </div>
  )
}
