"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Leaf, GitMerge, Sprout, MapPin, Calendar, Award,
  ImageIcon, Plus, Pencil, Trash2, Star, Clock, FlaskConical, Heart,
  Crosshair, Ruler, Activity, QrCode, FileText, CheckSquare, CalendarPlus,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addImage, setPrimaryImage, deleteImage } from "@/server/actions/images"
import { updatePlant, deletePlant } from "@/server/actions/plants"
import { getSpecies } from "@/server/actions/species"
import { createNote, deleteNote } from "@/server/actions/notes"
import { upsertTraitValue } from "@/server/actions/traits"
import { getTasks, createTask, toggleTask, deleteTask } from "@/server/actions/tasks"
import { getDocuments, createDocument, deleteDocument } from "@/server/actions/documents"
import { PedigreeTree } from "@/components/plant/pedigree-tree"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { TraitBar, TraitText, TraitBoolean } from "@/components/profiles/trait-bar"
import { GoalMatchCard } from "@/components/profiles/goal-match-card"
import { EventTimeline } from "@/components/profiles/event-timeline"
import { StatCard, StatGrid } from "@/components/profiles/stat-card"

export function PlantDetailClient({ plant: initialPlant }: any) {
  const router = useRouter()
  const [plant, setPlant] = useState(initialPlant)

  function reload() { router.refresh() }

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: plant.name,
    varietyName: plant.varietyName ?? "",
    speciesId: plant.speciesId ?? "",
    description: plant.description ?? "",
    origin: plant.origin ?? "",
    year: plant.year?.toString() ?? "",
    colour: plant.colour ?? "",
    fragrance: plant.fragrance ?? "",
    diseaseResistance: plant.diseaseResistance ?? "",
    repeatFlowering: plant.repeatFlowering ?? false,
    status: plant.status ?? "ACTIVE",
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [species, setSpecies] = useState<any[]>([])

  useEffect(() => { getSpecies().then(setSpecies) }, [])

  async function handleEdit() {
    setSavingEdit(true)
    const result = await updatePlant(plant.id, editForm)
    setSavingEdit(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Plant updated")
    setEditOpen(false)
    router.refresh()
  }

  async function handleDeletePlant() {
    const result = await deletePlant(plant.id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Plant deleted")
    router.push("/plants")
  }

  const allSeedlings = [...(plant.seedlingsFrom ?? []), ...(plant.seedlingCrosses ?? [])]

  const primaryImage = plant.images?.find((i: any) => i.isPrimary) ?? plant.images?.[0]

  const timeline: { date: Date; label: string; type: string }[] = []
  if (plant.createdAt) timeline.push({ date: new Date(plant.createdAt), label: "Added to collection", type: "plant" })
  if (plant.year) timeline.push({ date: new Date(`${plant.year}-01-01`), label: `Bred in ${plant.year}`, type: "breeding" })
  plant.crossesAsSeedParent?.forEach((c: any) => {
    if (c.createdAt) timeline.push({ date: new Date(c.createdAt), label: `Seed parent: ${plant.name} × ${c.pollenParent?.name ?? "?"} (${c.crossNumber ?? ""})`, type: "cross" })
  })
  plant.crossesAsPollenParent?.forEach((c: any) => {
    if (c.createdAt) timeline.push({ date: new Date(c.createdAt), label: `Pollen parent: ${c.seedParent?.name ?? "?"} × ${plant.name} (${c.crossNumber ?? ""})`, type: "cross" })
  })
  plant.note?.forEach((n: any) => {
    timeline.push({ date: new Date(n.createdAt), label: `Note: ${n.title ?? (n.content ?? "").slice(0, 60)}`, type: "note" })
  })
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime())

  const totalCrosses = (plant.crossesAsSeedParent?.length ?? 0) + (plant.crossesAsPollenParent?.length ?? 0)

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Plants", href: "/plants" }, { label: plant.name }]} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card overflow-hidden">
            {primaryImage ? (
              <div className="aspect-[3/1] sm:aspect-[4/1] overflow-hidden bg-muted">
                <img src={primaryImage.url} alt={plant.name} className="size-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[4/1] bg-gradient-to-br from-primary/5 to-muted flex items-center justify-center">
                <Leaf className="size-12 text-muted-foreground/20" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight">{plant.name}</h1>
                    {plant.status && <Badge className="text-xs">{plant.status}</Badge>}
                    {plant.isBreederLine && <Badge className="border-purple-500/30 bg-purple-500/10 text-purple-500 text-xs" variant="outline">Breeder Line</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plant.species?.name}{plant.varietyName ? ` · ${plant.varietyName}` : ""}{plant.year ? ` · ${plant.year}` : ""}
                  </p>
                  {plant.description && <p className="text-sm text-muted-foreground/80 mt-2 max-w-xl">{plant.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDialog title="Delete plant?" description="This will permanently remove this plant and all associated data." onConfirm={handleDeletePlant}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </ConfirmDialog>
                  <Link href={`/crosses/new?seedParentId=${plant.id}`}>
                    <Button variant="outline" size="sm"><GitMerge className="mr-1.5 size-3.5" />Cross</Button>
                  </Link>
                  <Link href={`/label?type=plant&id=${plant.id}`} target="_blank">
                    <Button variant="outline" size="sm"><QrCode className="mr-1.5 size-3.5" />Label</Button>
                  </Link>
                  <ImageGalleryInline images={plant.images ?? []} plantId={plant.id} onUpdate={reload} />
                </div>
              </div>
            </div>
          </div>

          <StatGrid>
            {plant.year && <StatCard icon={Calendar} label="Year" value={plant.year} />}
            {plant.origin && <StatCard icon={MapPin} label="Origin" value={plant.origin} />}
            {plant.inventoryCount != null && <StatCard icon={Leaf} label="Inventory" value={plant.inventoryCount} sub="plants" />}
            {plant.location && <StatCard icon={MapPin} label="Location" value={plant.location.name} />}
            <StatCard icon={GitMerge} label="Crosses" value={totalCrosses} />
            <StatCard icon={Sprout} label="Offspring" value={allSeedlings.length} />
            <StatCard icon={Award} label="Goal Scores" value={plant.goalScores?.length ?? 0} />
            {plant.pollenFertility != null && <StatCard icon={FlaskConical} label="Pollen" value={`${plant.pollenFertility}%`} />}
          </StatGrid>

          {(plant.traitValues?.length > 0 || plant.colour || plant.fragrance || plant.diseaseResistance != null) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Traits</CardTitle>
                  <TraitValuesEditor plant={plant} onUpdate={reload} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {plant.colour && <TraitText label="Flower Colour" value={plant.colour} />}
                  {plant.fragrance && <TraitText label="Fragrance" value={plant.fragrance} />}
                  {plant.diseaseResistance && <TraitText label="Disease Resistance" value={plant.diseaseResistance} />}
                  {plant.repeatFlowering != null && <TraitBoolean label="Repeat Flowering" value={plant.repeatFlowering} />}
                  {plant.traitValues?.map((tv: any) => {
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
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><GitMerge className="size-4" />Breeding History</CardTitle></CardHeader>
              <CardContent>
                {totalCrosses === 0 ? (
                  <div className="text-center py-8">
                    <GitMerge className="mx-auto size-6 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No crosses yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plant.crossesAsSeedParent?.slice(0, 5).map((cross: any) => (
                      <Link key={cross.id} href={`/crosses/${cross.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                        <div className="size-2 rounded-full bg-rose-500/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{plant.name} × {cross.pollenParent?.name ?? "?"}</p>
                          <p className="text-xs text-muted-foreground">{cross.crossNumber ?? "No number"}{cross.seedCount != null ? ` · ${cross.seedCount} seeds` : ""}</p>
                        </div>
                      </Link>
                    ))}
                    {plant.crossesAsPollenParent?.slice(0, 5).map((cross: any) => (
                      <Link key={cross.id} href={`/crosses/${cross.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                        <div className="size-2 rounded-full bg-blue-500/60 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{cross.seedParent?.name ?? "?"} × {plant.name}</p>
                          <p className="text-xs text-muted-foreground">{cross.crossNumber ?? "No number"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sprout className="size-4" />Offspring</CardTitle></CardHeader>
              <CardContent>
                {allSeedlings.length === 0 ? (
                  <div className="text-center py-8">
                    <Sprout className="mx-auto size-6 text-muted-foreground/40" />
                    <p className="mt-2 text-sm text-muted-foreground">No seedlings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allSeedlings.slice(0, 8).map((s: any) => (
                      <Link key={s.id} href={`/seedlings/${s.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                        <Sprout className="size-3.5 text-muted-foreground" />
                        <span className="text-sm">{s.seedlingId}</span>
                        {s.disposition && <Badge variant="outline" className="text-[10px] ml-auto">{s.disposition}</Badge>}
                      </Link>
                    ))}
                    {allSeedlings.length > 8 && <p className="text-xs text-muted-foreground text-center pt-2">+{allSeedlings.length - 8} more</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="size-4" />Timeline</CardTitle></CardHeader>
            <CardContent>
              <EventTimeline events={timeline} emptyMessage="No timeline events" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                Pedigree
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(plant.crossesAsSeedParent?.length === 0 && plant.crossesAsPollenParent?.length === 0 && allSeedlings.length === 0) ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No pedigree information available</div>
              ) : (
                <PedigreeTree plant={plant} />
              )}
            </CardContent>
          </Card>

          <NotesSection notes={plant.note ?? []} plantId={plant.id} onUpdate={reload} />
          <TasksSection plantId={plant.id} onUpdate={reload} />
          <DocumentsSection plantId={plant.id} onUpdate={reload} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Breeding Potential</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pollen Fertility</p>
                {plant.pollenFertility != null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${plant.pollenFertility}%` }} />
                    </div>
                    <span className="text-sm font-medium">{plant.pollenFertility}%</span>
                  </div>
                ) : <span className="text-sm text-muted-foreground">Not recorded</span>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Seed Fertility</p>
                {plant.seedFertility != null ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${plant.seedFertility}%` }} />
                    </div>
                    <span className="text-sm font-medium">{plant.seedFertility}%</span>
                  </div>
                ) : <span className="text-sm text-muted-foreground">Not recorded</span>}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plant.isBreederLine && <Badge className="border-purple-500/30 bg-purple-500/10 text-purple-500" variant="outline">Breeder Line</Badge>}
                {plant.isSeedParent && <Badge variant="outline">Seed Parent</Badge>}
                {plant.isPollenParent && <Badge variant="outline">Pollen Parent</Badge>}
              </div>
            </CardContent>
          </Card>

          {plant.goalScores?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Breeding Goals</p>
              {plant.goalScores.map((gs: any) => (
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

          <div className="flex flex-col gap-2">
            <Link href={`/crosses/new?seedParentId=${plant.id}`}><Button variant="outline" size="sm" className="w-full"><GitMerge className="mr-2 size-4" />Cross as Seed (♀)</Button></Link>
            <Link href={`/crosses/new?pollenParentId=${plant.id}`}><Button variant="outline" size="sm" className="w-full"><GitMerge className="mr-2 size-4" />Cross as Pollen (♂)</Button></Link>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Plant</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-varietyName">Variety Name</Label>
              <Input id="edit-varietyName" value={editForm.varietyName} onChange={(e) => setEditForm({ ...editForm, varietyName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-species">Species</Label>
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
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-origin">Origin</Label>
                <Input id="edit-origin" value={editForm.origin} onChange={(e) => setEditForm({ ...editForm, origin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input id="edit-year" type="number" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
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
            <div className="space-y-2">
              <Label htmlFor="edit-diseaseResistance">Disease Resistance</Label>
              <Input id="edit-diseaseResistance" value={editForm.diseaseResistance} onChange={(e) => setEditForm({ ...editForm, diseaseResistance: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="edit-repeatFlowering" checked={editForm.repeatFlowering} onCheckedChange={(v: boolean) => setEditForm({ ...editForm, repeatFlowering: v })} />
              <Label htmlFor="edit-repeatFlowering">Repeat Flowering</Label>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v ?? "ACTIVE" })}>
                <SelectTrigger><SelectValue>{["ACTIVE", "DORMANT", "DECEASED", "RETIRED", "SOLD", "GIFTED"].find(v => v === editForm.status)}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DORMANT">Dormant</SelectItem>
                  <SelectItem value="DECEASED">Deceased</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                  <SelectItem value="SOLD">Sold</SelectItem>
                  <SelectItem value="GIFTED">Gifted</SelectItem>
                </SelectContent>
              </Select>
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

function ImageGalleryInline({ images, plantId, onUpdate }: { images: any[]; plantId: string; onUpdate: () => void }) {
  const [urlOpen, setUrlOpen] = useState(false)
  const [url, setUrl] = useState("")

  async function handleAddUrl() {
    if (!url.trim()) return
    const result = await addImage({ url: url.trim(), plantId, isPrimary: images.length === 0 })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Image added")
    setUrl("")
    setUrlOpen(false)
    onUpdate()
  }

  async function handleSetPrimary(id: string) {
    await setPrimaryImage(id, "plant", plantId)
    toast.success("Primary image updated")
    onUpdate()
  }

  async function handleDelete(imgId: string) {
    await deleteImage(imgId, plantId)
    toast.success("Image removed")
    onUpdate()
  }

  return (
    <div className="flex items-center gap-1">
      <Dialog open={urlOpen} onOpenChange={setUrlOpen}>
        <DialogTrigger render={<Button variant="ghost" size="sm"><ImageIcon className="size-3.5" /></Button>} />
        <DialogContent>
          <DialogHeader><DialogTitle>Add Image</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddUrl() }} className="space-y-4">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/plant.jpg" />
            <Button type="submit" className="w-full">Add Image</Button>
          </form>
        </DialogContent>
      </Dialog>
      {images.length > 0 && (
        <div className="flex gap-1">
          {images.slice(0, 4).map((img: any) => (
            <div key={img.id} className="group relative size-8 rounded-md overflow-hidden bg-muted shrink-0">
              <img src={img.url} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5">
                {!img.isPrimary && (
                  <button onClick={() => handleSetPrimary(img.id)} className="p-0.5 rounded-full bg-white/20 hover:bg-white/40 text-white" title="Set as primary">
                    <Star className="size-2.5" />
                  </button>
                )}
                <ConfirmDialog title="Remove image?" description="This action cannot be undone." onConfirm={() => handleDelete(img.id)}>
                  <button className="p-0.5 rounded-full bg-white/20 hover:bg-white/40 text-white" title="Remove">
                    <Trash2 className="size-2.5" />
                  </button>
                </ConfirmDialog>
              </div>
              {img.isPrimary && <div className="absolute top-0.5 left-0.5 size-2 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotesSection({ notes, plantId, onUpdate }: { notes: any[]; plantId: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")

  async function handleCreate() {
    if (!content.trim()) return
    const result = await createNote({ content, title: title || undefined, plantId })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Note added")
    setContent("")
    setTitle("")
    setOpen(false)
    onUpdate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Notes</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm"><Plus className="mr-1.5 size-3.5" />Add Note</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} required placeholder="Write a note..." />
                <Button type="submit" className="w-full">Save Note</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
        ) : (
          <div className="space-y-2">
            {notes.map((note: any) => (
              <div key={note.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {note.title && <p className="text-sm font-medium">{note.title}</p>}
                    <p className="text-sm text-muted-foreground mt-0.5">{note.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <ConfirmDialog title="Delete note?" description="This action cannot be undone." onConfirm={async () => { await deleteNote(note.id, plantId); onUpdate(); }}>
                    <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3" />
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TraitValuesEditor({ plant, onUpdate }: { plant: any; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  const traits = plant.species?.traits ?? []
  const noSpecies = !plant.species
  const noTraits = plant.species && traits.length === 0

  useEffect(() => {
    if (!open) return
    const initial: Record<string, any> = {}
    plant.traitValues?.forEach((tv: any) => {
      initial[tv.traitId] = tv.value
    })
    traits.forEach((t: any) => {
      if (!(t.id in initial)) {
        if (t.type === "BOOLEAN") initial[t.id] = false
        else if (t.type === "YES_NO") initial[t.id] = "No"
        else initial[t.id] = ""
      }
    })
    setValues(initial)
  }, [open])

  async function handleSave() {
    setSaving(true)
    for (const [traitId, value] of Object.entries(values)) {
      const result = await upsertTraitValue({ traitId, plantId: plant.id, value })
      if (!result.success) { toast.error(result.error); setSaving(false); return }
    }
    setSaving(false)
    toast.success("Traits updated")
    setOpen(false)
    onUpdate()
  }

  const inputForTrait = (trait: any) => {
    const val = values[trait.id] ?? ""
    switch (trait.type) {
      case "SCALE_1_5":
        return <Input type="number" min={1} max={5} value={val} onChange={(e) => setValues({ ...values, [trait.id]: e.target.value })} />
      case "SCALE_1_10":
        return <Input type="number" min={1} max={10} value={val} onChange={(e) => setValues({ ...values, [trait.id]: e.target.value })} />
      case "BOOLEAN":
        return <Checkbox checked={val === true || val === "true"} onCheckedChange={(v: boolean) => setValues({ ...values, [trait.id]: v })} />
      case "TEXT":
        return <Input type="text" value={val} onChange={(e) => setValues({ ...values, [trait.id]: e.target.value })} />
      case "PERCENTAGE":
        return (
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={100} value={val} onChange={(e) => setValues({ ...values, [trait.id]: e.target.value })} />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )
      case "NUMERIC":
        return <Input type="number" value={val} onChange={(e) => setValues({ ...values, [trait.id]: e.target.value })} />
      case "YES_NO":
        return (
          <Select value={String(val)} onValueChange={(v) => setValues({ ...values, [trait.id]: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        return <Input type="text" value={val} onChange={(e) => setValues({ ...values, [trait.id]: e.target.value })} />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm"><Pencil className="mr-1.5 size-3.5" />Edit Traits</Button>} />
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Traits</DialogTitle></DialogHeader>
        {noSpecies ? (
          <p className="text-sm text-muted-foreground text-center py-4">Assign a species first</p>
        ) : noTraits ? (
          <p className="text-sm text-muted-foreground text-center py-4">No traits defined for this species</p>
        ) : (
          <div className="space-y-4">
            {traits.map((trait: any) => (
              <div key={trait.id} className="space-y-2">
                <Label>{trait.name}</Label>
                {inputForTrait(trait)}
              </div>
            ))}
          </div>
        )}
        {!noSpecies && !noTraits && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TasksSection({ plantId, onUpdate }: { plantId: string; onUpdate: () => void }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => { getTasks("plant", plantId).then(setTasks) }, [plantId])

  async function handleCreate() {
    if (!title.trim()) return
    const result = await createTask({ title: title.trim(), dueDate: dueDate || undefined, plantId })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Task created")
    setTitle("")
    setDueDate("")
    setOpen(false)
    const updated = await getTasks("plant", plantId)
    setTasks(updated)
    onUpdate()
  }

  async function handleToggle(task: any) {
    const result = await toggleTask(task.id, !task.completed)
    if (!result.success) { toast.error(result.error); return }
    const updated = await getTasks("plant", plantId)
    setTasks(updated)
    onUpdate()
  }

  async function handleDelete(taskId: string) {
    const result = await deleteTask(taskId)
    if (!result.success) { toast.error(result.error); return }
    const updated = await getTasks("plant", plantId)
    setTasks(updated)
    onUpdate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><CheckSquare className="size-4" />Tasks</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm"><CalendarPlus className="mr-1.5 size-3.5" />Add Task</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What needs to be done?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due">Due Date (optional)</Label>
                  <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Create Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: any) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox checked={task.completed} onCheckedChange={() => handleToggle(task)} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                  {task.dueDate && <p className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString()}</p>}
                </div>
                <ConfirmDialog title="Delete task?" description="This action cannot be undone." onConfirm={() => handleDelete(task.id)}>
                  <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3" />
                  </Button>
                </ConfirmDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DocumentsSection({ plantId, onUpdate }: { plantId: string; onUpdate: () => void }) {
  const [docs, setDocs] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  useEffect(() => { getDocuments(plantId).then(setDocs) }, [plantId])

  async function handleCreate() {
    if (!title.trim() || !url.trim()) return
    const result = await createDocument({ title: title.trim(), url: url.trim(), plantId })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Document added")
    setTitle("")
    setUrl("")
    setOpen(false)
    const updated = await getDocuments(plantId)
    setDocs(updated)
    onUpdate()
  }

  async function handleDelete(docId: string) {
    const result = await deleteDocument(docId)
    if (!result.success) { toast.error(result.error); return }
    const updated = await getDocuments(plantId)
    setDocs(updated)
    onUpdate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="size-4" />Documents</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline" size="sm"><Plus className="mr-1.5 size-3.5" />Add Document</Button>} />
            <DialogContent>
              <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Title</Label>
                  <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Document name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-url">URL</Label>
                  <Input id="doc-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://..." />
                </div>
                <Button type="submit" className="w-full">Add Document</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No documents yet</p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex-1 min-w-0">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">{doc.title}</a>
                </div>
                <ConfirmDialog title="Delete document?" description="This action cannot be undone." onConfirm={() => handleDelete(doc.id)}>
                  <Button variant="ghost" size="icon" className="size-6 shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3" />
                  </Button>
                </ConfirmDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
