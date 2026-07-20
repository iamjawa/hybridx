"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sprout, Heart, Ruler, Eye, Activity, Star, Target, GitMerge, Clock, CheckCircle2, XCircle, QrCode, Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { toggleFavourite, setDisposition, updateSeedling } from "@/server/actions/seedlings"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TraitBar, TraitText, TraitBoolean } from "@/components/profiles/trait-bar"
import { GoalMatchCard } from "@/components/profiles/goal-match-card"
import { EventTimeline } from "@/components/profiles/event-timeline"

const dispositionConfig: Record<string, { label: string; icon: any; color: string; activeColor: string }> = {
  SELECTED: { label: "Select", icon: CheckCircle2, color: "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10", activeColor: "bg-emerald-500 text-white hover:bg-emerald-600" },
  KEPT: { label: "Keep", icon: Heart, color: "border-blue-500/30 text-blue-600 hover:bg-blue-500/10", activeColor: "bg-blue-500 text-white hover:bg-blue-600" },
  CULLED: { label: "Cull", icon: XCircle, color: "border-red-500/30 text-red-600 hover:bg-red-500/10", activeColor: "bg-red-500 text-white hover:bg-red-600" },
  SOLD: { label: "Sell", icon: Target, color: "border-amber-500/30 text-amber-600 hover:bg-amber-500/10", activeColor: "bg-amber-500 text-white hover:bg-amber-600" },
  GIFTED: { label: "Gift", icon: Star, color: "border-purple-500/30 text-purple-600 hover:bg-purple-500/10", activeColor: "bg-purple-500 text-white hover:bg-purple-600" },
  DEAD: { label: "Dead", icon: XCircle, color: "border-neutral-500/30 text-neutral-600 hover:bg-neutral-500/10", activeColor: "bg-neutral-500 text-white hover:bg-neutral-600" },
}

export function SeedlingDetailClient({ seedling }: any) {
  const router = useRouter()

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    seedlingId: seedling.seedlingId ?? "",
    year: seedling.year?.toString() ?? "",
    generation: seedling.generation ?? "",
    colour: seedling.colour ?? "",
    fragrance: seedling.fragrance ?? "",
    health: seedling.health?.toString() ?? "",
    diseaseResistance: seedling.diseaseResistance?.toString() ?? "",
    petalCount: seedling.petalCount?.toString() ?? "",
    bloomSize: seedling.bloomSize?.toString() ?? "",
    growthNotes: seedling.growthNotes ?? "",
    flowerNotes: seedling.flowerNotes ?? "",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleEdit() {
    setSavingEdit(true)
    const result = await updateSeedling(seedling.id, {
      ...editForm,
      year: editForm.year ? parseInt(editForm.year) : undefined,
      health: editForm.health ? parseInt(editForm.health) : undefined,
      diseaseResistance: editForm.diseaseResistance ? parseInt(editForm.diseaseResistance) : undefined,
      petalCount: editForm.petalCount ? parseInt(editForm.petalCount) : undefined,
      bloomSize: editForm.bloomSize ? parseFloat(editForm.bloomSize) : undefined,
    })
    setSavingEdit(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Seedling updated")
    setEditOpen(false)
    router.refresh()
  }

  async function handleFavourite() {
    await toggleFavourite(seedling.id)
    toast.success("Favourite toggled")
    router.refresh()
  }

  async function handleDisposition(disposition: string) {
    const result = await setDisposition(seedling.id, disposition)
    if (!result.success) { toast.error(result.error); return }
    toast.success(`Marked as ${dispositionConfig[disposition]?.label ?? disposition}`)
    router.refresh()
  }

  const latestEval = seedling.evaluations?.[0]
  const timeline: { date: Date; label: string }[] = []
  if (seedling.createdAt) timeline.push({ date: new Date(seedling.createdAt), label: "Seedling created" })
  if (seedling.evaluations?.length > 0) {
    seedling.evaluations.forEach((e: any) => {
      if (e.date) timeline.push({ date: new Date(e.date), label: `Evaluation: ${e.systemName}${e.totalScore != null ? ` — ${e.totalScore}/10` : ""}` })
    })
  }
  if (seedling.disposition) {
    timeline.push({ date: new Date(seedling.updatedAt ?? seedling.createdAt), label: `Disposition set to ${seedling.disposition}` })
  }
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Seedlings", href: "/seedlings" }, { label: seedling.seedlingId }]} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="aspect-[3/1] sm:aspect-[5/1] bg-gradient-to-br from-emerald-500/5 to-muted flex items-center justify-center">
              {seedling.images?.[0] ? (
                <img src={seedling.images[0].url} alt={seedling.seedlingId} className="size-full object-cover" />
              ) : (
                <Sprout className="size-12 text-muted-foreground/20" />
              )}
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight">{seedling.seedlingId}</h1>
                    {seedling.disposition && (
                      <Badge className={
                        seedling.disposition === "SELECTED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
                        seedling.disposition === "KEPT" ? "border-blue-500/30 bg-blue-500/10 text-blue-500" :
                        seedling.disposition === "CULLED" ? "border-red-500/30 bg-red-500/10 text-red-500" :
                        "border-neutral-500/30 bg-neutral-500/10 text-neutral-500"
                      } variant="outline">{seedling.disposition}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {seedling.cross?.seedParent?.name ?? "?"} × {seedling.cross?.pollenParent?.name ?? "?"}
                    {seedling.generation ? ` · ${seedling.generation}` : ""}
                    {seedling.species ? ` · ${seedling.species.name}` : ""}
                    · Year {seedling.year}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Link href={`/evaluation/quick`}>
                    <Button variant="default" size="sm"><Star className="mr-1.5 size-3.5" />Evaluate</Button>
                  </Link>
                  <Link href={`/label?type=seedling&id=${seedling.id}`} target="_blank">
                    <Button variant="outline" size="sm"><QrCode className="mr-1.5 size-3.5" />Label</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleFavourite}>
                    <Heart className={`mr-1.5 size-3.5 ${seedling.isFavourite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(dispositionConfig).map(([key, config]) => {
                  const isActive = seedling.disposition === key
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDisposition(key)}
                      className={isActive ? config.activeColor : config.color}
                    >
                      <config.icon className="mr-1.5 size-3.5" />
                      {config.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <CompactStat icon={Ruler} label="Bloom Size" value={seedling.bloomSize ? `${seedling.bloomSize}cm` : "—"} />
            <CompactStat icon={Activity} label="Health" value={seedling.health != null ? `${seedling.health}/10` : "—"} />
            <CompactStat icon={Eye} label="Disease Res." value={seedling.diseaseResistance != null ? `${seedling.diseaseResistance}/10` : "—"} />
            <CompactStat icon={Star} label="Petals" value={seedling.petalCount ?? "—"} />
          </div>

          {latestEval && (
            <Card className="border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Latest Evaluation</span>
                  {latestEval.totalScore != null && (
                    <span className="text-2xl font-bold text-primary">{latestEval.totalScore}</span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{latestEval.systemName} · {new Date(latestEval.date).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {latestEval.scores && typeof latestEval.scores === "object" && Object.entries(latestEval.scores).map(([key, val]: any) => (
                    <TraitBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} max={10} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {(seedling.cross?.seedParent || seedling.cross?.pollenParent) && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GitMerge className="size-4" />Parents</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {seedling.cross?.seedParent && (
                    <Link href={`/plants/${seedling.cross.seedParent.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <div className="size-2 rounded-full bg-rose-500/60 shrink-0" />
                      <div><p className="text-sm font-medium">{seedling.cross.seedParent.name}</p><p className="text-xs text-muted-foreground">Seed Parent (♀)</p></div>
                    </Link>
                  )}
                  {seedling.cross?.pollenParent && (
                    <Link href={`/plants/${seedling.cross.pollenParent.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <div className="size-2 rounded-full bg-blue-500/60 shrink-0" />
                      <div><p className="text-sm font-medium">{seedling.cross.pollenParent.name}</p><p className="text-xs text-muted-foreground">Pollen Parent (♂)</p></div>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {(seedling.traitValues?.length > 0 || seedling.colour || seedling.fragrance) && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Traits</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {seedling.colour && <TraitText label="Colour" value={seedling.colour} />}
                  {seedling.fragrance && <TraitText label="Fragrance" value={seedling.fragrance} />}
                  {seedling.traitValues?.map((tv: any) => {
                    const val = Number(tv.value)
                    const type = tv.trait?.type
                    if (type === "BOOLEAN" || type === "YES_NO") {
                      return <TraitBoolean key={tv.id} label={tv.trait.name} value={tv.value === true || tv.value === "true" || tv.value === "Yes"} />
                    }
                    if (type === "PERCENTAGE") {
                      return <TraitText key={tv.id} label={tv.trait.name} value={`${val}%`} />
                    }
                    if (!isNaN(val) && type?.startsWith("SCALE")) {
                      const max = type === "SCALE_1_5" ? 5 : 10
                      return <TraitBar key={tv.id} label={tv.trait.name} value={val} max={max} />
                    }
                    return <TraitText key={tv.id} label={tv.trait?.name ?? "Trait"} value={String(tv.value)} />
                  })}
                </CardContent>
              </Card>
            )}
          </div>

          {seedling.evaluations?.length > 1 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Evaluation History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {seedling.evaluations.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{e.systemName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
                    </div>
                    {e.totalScore != null && (
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold">{e.totalScore}</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="size-4" />Timeline</CardTitle></CardHeader>
            <CardContent>
              <EventTimeline events={timeline} emptyMessage="No timeline events" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Quick Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Year</span><span className="text-sm font-medium">{seedling.year}</span></div>
              {seedling.generation && <div className="flex justify-between"><span className="text-xs text-muted-foreground">Generation</span><span className="text-sm font-medium">{seedling.generation}</span></div>}
              {seedling.petalCount != null && <div className="flex justify-between"><span className="text-xs text-muted-foreground">Petals</span><span className="text-sm font-medium">{seedling.petalCount}</span></div>}
              {seedling.bloomSize != null && <div className="flex justify-between"><span className="text-xs text-muted-foreground">Bloom Size</span><span className="text-sm font-medium">{seedling.bloomSize}cm</span></div>}
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Evaluations</span><span className="text-sm font-medium">{seedling.evaluations?.length ?? 0}</span></div>
            </CardContent>
          </Card>

          {seedling.goalScores?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Goal Matches</p>
              {seedling.goalScores.map((gs: any) => (
                <GoalMatchCard
                  key={gs.id}
                  goalName={gs.goal?.name ?? "Unknown goal"}
                  goalId={gs.goalId}
                  overallScore={gs.overallScore}
                  breakdown={Array.isArray(gs.breakdown) ? gs.breakdown : undefined}
                />
              ))}
            </div>
          )}

          {(seedling.growthNotes || seedling.flowerNotes) && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {seedling.growthNotes && <p>{seedling.growthNotes}</p>}
                {seedling.flowerNotes && <p>{seedling.flowerNotes}</p>}
              </CardContent>
            </Card>
          )}

          <Link href={`/crosses/new?seedParentId=${seedling.cross?.seedParentId}`}>
            <Button variant="outline" size="sm" className="w-full"><GitMerge className="mr-2 size-4" />Use as Parent</Button>
          </Link>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Seedling</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-seedlingId">Seedling ID</Label>
              <Input id="edit-seedlingId" value={editForm.seedlingId} onChange={(e) => setEditForm({ ...editForm, seedlingId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input id="edit-year" type="number" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-generation">Generation</Label>
                <Input id="edit-generation" value={editForm.generation} onChange={(e) => setEditForm({ ...editForm, generation: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-colour">Colour</Label>
                <Input id="edit-colour" value={editForm.colour} onChange={(e) => setEditForm({ ...editForm, colour: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fragrance">Fragrance</Label>
                <Input id="edit-fragrance" value={editForm.fragrance} onChange={(e) => setEditForm({ ...editForm, fragrance: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-health">Health (0-10)</Label>
                <Input id="edit-health" type="number" min="0" max="10" value={editForm.health} onChange={(e) => setEditForm({ ...editForm, health: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-diseaseResistance">Disease Resistance (0-10)</Label>
                <Input id="edit-diseaseResistance" type="number" min="0" max="10" value={editForm.diseaseResistance} onChange={(e) => setEditForm({ ...editForm, diseaseResistance: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-petalCount">Petal Count</Label>
                <Input id="edit-petalCount" type="number" value={editForm.petalCount} onChange={(e) => setEditForm({ ...editForm, petalCount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bloomSize">Bloom Size (cm)</Label>
                <Input id="edit-bloomSize" type="number" step="0.1" value={editForm.bloomSize} onChange={(e) => setEditForm({ ...editForm, bloomSize: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-growthNotes">Growth Notes</Label>
              <Textarea id="edit-growthNotes" value={editForm.growthNotes} onChange={(e) => setEditForm({ ...editForm, growthNotes: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-flowerNotes">Flower Notes</Label>
              <Textarea id="edit-flowerNotes" value={editForm.flowerNotes} onChange={(e) => setEditForm({ ...editForm, flowerNotes: e.target.value })} />
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

function CompactStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center space-y-1">
      <Icon className="size-4 mx-auto text-muted-foreground" />
      <p className="text-lg font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
