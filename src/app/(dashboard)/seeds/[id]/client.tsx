"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Calendar, Thermometer, Sprout, Hash, Activity, FlaskConical, Pencil } from "lucide-react"
import Link from "next/link"
import { startStratification, recordGermination, createSeedlingsFromSeed, getSeedById, updateSeed } from "@/server/actions/seeds"
import { getSpecies } from "@/server/actions/species"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SEED_STAGE_LABELS } from "@/lib/constants"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export function SeedDetailClient({ seed: initialSeed }: any) {
  const router = useRouter()
  const [seed, setSeed] = useState(initialSeed)

  const [stratOpen, setStratOpen] = useState(false)
  const [stratForm, setStratForm] = useState({ stage: "COLD_STRATIFYING", coldStratDays: "", warmStratDays: "", notes: "" })

  const [germOpen, setGermOpen] = useState(false)
  const [germForm, setGermForm] = useState({ germinatedCount: "", failedCount: "", notes: "" })

  const [batchOpen, setBatchOpen] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    batchNumber: seed.batchNumber ?? "",
    speciesId: seed.speciesId ?? "",
    totalCount: seed.totalCount?.toString() ?? "",
    viableCount: seed.viableCount?.toString() ?? "",
    harvestDate: seed.harvestDate ? new Date(seed.harvestDate).toISOString().split("T")[0] : "",
    storageCondition: seed.storageCondition ?? "",
    notes: seed.notes ?? "",
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [species, setSpecies] = useState<any[]>([])

  useEffect(() => { getSpecies().then(setSpecies) }, [])

  async function handleEdit() {
    setSavingEdit(true)
    const result = await updateSeed(seed.id, {
      ...editForm,
      totalCount: editForm.totalCount ? parseInt(editForm.totalCount) : undefined,
      viableCount: editForm.viableCount ? parseInt(editForm.viableCount) : undefined,
      harvestDate: editForm.harvestDate ? new Date(editForm.harvestDate) : undefined,
    })
    setSavingEdit(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Seed batch updated")
    setEditOpen(false)
    const updated = await getSeedById(seed.id)
    if (updated) setSeed(updated)
    router.refresh()
  }
  const [batchCount, setBatchCount] = useState("10")

  async function handleStartStratification() {
    const result = await startStratification(seed.id, {
      stage: stratForm.stage,
      coldStratDays: stratForm.coldStratDays ? parseInt(stratForm.coldStratDays) : undefined,
      warmStratDays: stratForm.warmStratDays ? parseInt(stratForm.warmStratDays) : undefined,
      notes: stratForm.notes || undefined,
    })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Stratification started")
    setStratOpen(false)
    const updated = await getSeedById(seed.id)
    if (updated) setSeed(updated)
    router.refresh()
  }

  async function handleRecordGermination() {
    const result = await recordGermination(seed.id, {
      germinatedCount: germForm.germinatedCount ? parseInt(germForm.germinatedCount) : undefined,
      failedCount: germForm.failedCount ? parseInt(germForm.failedCount) : undefined,
    })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Germination recorded")
    setGermOpen(false)
    const updated = await getSeedById(seed.id)
    if (updated) setSeed(updated)
    router.refresh()
  }

  async function handleBatchCreate() {
    const count = parseInt(batchCount)
    if (count < 1 || count > 500) { toast.error("Enter a number between 1 and 500"); return }
    const result = await createSeedlingsFromSeed(seed.id, count)
    if (!result.success) { toast.error(result.error); return }
    toast.success(`Created ${count} seedlings`)
    setBatchOpen(false)
    const updated = await getSeedById(seed.id)
    if (updated) setSeed(updated)
    router.refresh()
  }

  const canStratify = seed.stage === "STORED" || seed.stage === "HARVESTED" || seed.stage === "CLEANED"
  const canGerminate = seed.stage === "STRATIFYING" || seed.stage === "COLD_STRATIFYING" || seed.stage === "WARM_STRATIFYING" || seed.stage === "GERMINATING"
  const canCreateSeedlings = seed.stage === "GERMINATED" || seed.stage === "GERMINATING"

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Seeds", href: "/seeds" }, { label: seed.batchNumber ?? "Seed batch" }]} />
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Database className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{seed.batchNumber ?? "Unnamed Batch"}</h1>
            <Badge className={
              seed.stage === "GERMINATED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
              seed.stage === "FAILED" ? "border-red-500/30 bg-red-500/10 text-red-500" :
              "border-blue-500/30 bg-blue-500/10 text-blue-500"
            } variant="outline">{SEED_STAGE_LABELS[seed.stage] ?? seed.stage}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {seed.species?.name ?? "Unknown species"}{seed.cross ? ` · ${seed.cross.seedParent?.name ?? "?"} × ${seed.cross.pollenParent?.name ?? "?"}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {canStratify && (
          <Dialog open={stratOpen} onOpenChange={setStratOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              <FlaskConical className="mr-2 size-4" />Start Stratification
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Start Stratification</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleStartStratification() }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={stratForm.stage} onValueChange={(v) => setStratForm({ ...stratForm, stage: v ?? "COLD_STRATIFYING" })}>
                    <SelectTrigger><SelectValue>{["COLD_STRATIFYING", "WARM_STRATIFYING"].find(v => v === stratForm.stage)}</SelectValue></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLD_STRATIFYING">Cold Stratification</SelectItem>
                      <SelectItem value="WARM_STRATIFYING">Warm Stratification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coldDays">Cold Days</Label>
                    <Input id="coldDays" type="number" value={stratForm.coldStratDays} onChange={(e) => setStratForm({ ...stratForm, coldStratDays: e.target.value })} placeholder="e.g. 30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warmDays">Warm Days</Label>
                    <Input id="warmDays" type="number" value={stratForm.warmStratDays} onChange={(e) => setStratForm({ ...stratForm, warmStratDays: e.target.value })} placeholder="e.g. 14" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stratNotes">Notes</Label>
                  <Textarea id="stratNotes" value={stratForm.notes} onChange={(e) => setStratForm({ ...stratForm, notes: e.target.value })} placeholder="Temperature, medium, location..." />
                </div>
                <Button type="submit" className="w-full">Begin Stratification</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {canGerminate && (
          <Dialog open={germOpen} onOpenChange={setGermOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              <Sprout className="mr-2 size-4" />Record Germination
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Germination Results</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleRecordGermination() }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="germCount">Germinated</Label>
                    <Input id="germCount" type="number" value={germForm.germinatedCount} onChange={(e) => setGermForm({ ...germForm, germinatedCount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="failCount">Failed</Label>
                    <Input id="failCount" type="number" value={germForm.failedCount} onChange={(e) => setGermForm({ ...germForm, failedCount: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Record</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {canCreateSeedlings && (
          <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
            <DialogTrigger render={<Button variant="default" size="sm" />}>
              <Sprout className="mr-2 size-4" />Create Seedlings
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Seedlings from Batch</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleBatchCreate() }} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate seedling records for this germinated batch. Each seedling gets a unique ID.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="batchCount">Number of seedlings</Label>
                  <Input id="batchCount" type="number" min="1" max="500" value={batchCount} onChange={(e) => setBatchCount(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Create {batchCount} Seedlings</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seedlings">Seedlings ({seed.seedlings?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="stratification">Stratification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Hash className="size-4 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Total Seeds</p><p className="text-sm font-medium">{seed.totalCount}</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Activity className="size-4 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Viable</p><p className="text-sm font-medium">{seed.viableCount ?? "—"}</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Sprout className="size-4 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Germinated</p><p className="text-sm font-medium">{seed.germinatedCount ?? "—"}</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-3 p-4">
              <Calendar className="size-4 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Harvested</p><p className="text-sm font-medium">{seed.harvestDate ? new Date(seed.harvestDate).toLocaleDateString() : "—"}</p></div>
            </CardContent></Card>
          </div>

          {seed.successRate != null && (
            <Card><CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${seed.successRate}%` }} />
                </div>
                <span className="text-sm font-medium">{seed.successRate}%</span>
              </div>
            </CardContent></Card>
          )}

          {seed.notes && (
            <Card><CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{seed.notes}</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="seedlings" className="mt-6">
          {(!seed.seedlings || seed.seedlings.length === 0) ? (
            <Card><CardContent className="py-8 text-center">
              <Sprout className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No seedlings created yet from this batch</p>
              {canCreateSeedlings && (
                <p className="text-xs text-muted-foreground mt-1">Use the "Create Seedlings" button above</p>
              )}
            </CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seed.seedlings.map((s: any) => (
                <Link key={s.id} href={`/seedlings/${s.id}`}>
                  <Card className="transition-colors hover:border-border/80">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Sprout className="size-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.seedlingId}</p>
                        <p className="text-xs text-muted-foreground">Year {s.year}</p>
                      </div>
                      {s.evaluations?.[0]?.totalScore != null && (
                        <Badge variant="secondary">{s.evaluations[0].totalScore}</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stratification" className="mt-6 space-y-4">
          {!seed.stratificationStart && seed.stage !== "STRATIFYING" && seed.stage !== "COLD_STRATIFYING" && seed.stage !== "WARM_STRATIFYING" && seed.stage !== "GERMINATING" && seed.stage !== "GERMINATED" ? (
            <Card><CardContent className="py-8 text-center">
              <FlaskConical className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">Stratification not started</p>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {seed.stratificationStart && (
                <Card><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Started</p>
                  <p className="mt-1 text-sm font-medium">{new Date(seed.stratificationStart).toLocaleDateString()}</p>
                </CardContent></Card>
              )}
              {seed.coldStratDays != null && (
                <Card><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Thermometer className="size-3" /> Cold Duration</p>
                  <p className="mt-1 text-sm font-medium">{seed.coldStratDays} days</p>
                </CardContent></Card>
              )}
              {seed.warmStratDays != null && (
                <Card><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Thermometer className="size-3" /> Warm Duration</p>
                  <p className="mt-1 text-sm font-medium">{seed.warmStratDays} days</p>
                </CardContent></Card>
              )}
              {seed.storageCondition && (
                <Card><CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="mt-1 text-sm font-medium">{seed.storageCondition}</p>
                </CardContent></Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Seed Batch</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-batchNumber">Batch Number</Label>
              <Input id="edit-batchNumber" value={editForm.batchNumber} onChange={(e) => setEditForm({ ...editForm, batchNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Species</Label>
              <Select value={editForm.speciesId} onValueChange={(v) => setEditForm({ ...editForm, speciesId: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select species">{species.find((s: any) => s.id === editForm.speciesId)?.name}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {species.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-totalCount">Total Count</Label>
                <Input id="edit-totalCount" type="number" value={editForm.totalCount} onChange={(e) => setEditForm({ ...editForm, totalCount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-viableCount">Viable Count</Label>
                <Input id="edit-viableCount" type="number" value={editForm.viableCount} onChange={(e) => setEditForm({ ...editForm, viableCount: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-harvestDate">Harvest Date</Label>
              <Input id="edit-harvestDate" type="date" value={editForm.harvestDate} onChange={(e) => setEditForm({ ...editForm, harvestDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-storageCondition">Storage Condition</Label>
              <Input id="edit-storageCondition" value={editForm.storageCondition} onChange={(e) => setEditForm({ ...editForm, storageCondition: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <Button type="submit" disabled={savingEdit} className="w-full">
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
