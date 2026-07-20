"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flower2, Plus, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { createTrait, deleteTrait, updateSpecies, deleteSpecies } from "@/server/actions/species"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SpeciesDetailClient({ species }: any) {
  const router = useRouter()
  const [traits, setTraits] = useState(species.traits || [])

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: species.name,
    description: species.description ?? "",
    pollenViability: species.pollenViability?.toString() ?? "100",
    seedViability: species.seedViability?.toString() ?? "100",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleEdit() {
    setSavingEdit(true)
    const result = await updateSpecies(species.id, {
      name: editForm.name,
      description: editForm.description || undefined,
      pollenViability: parseInt(editForm.pollenViability),
      seedViability: parseInt(editForm.seedViability),
    })
    setSavingEdit(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Species updated")
    setEditOpen(false)
    router.refresh()
  }

  async function handleDeleteSpecies() {
    const result = await deleteSpecies(species.id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Species deleted")
    router.push("/species")
  }
  const [traitOpen, setTraitOpen] = useState(false)
  const [traitForm, setTraitForm] = useState({ name: "", slug: "", type: "SCALE_1_10", category: "General", description: "" })
  const [saving, setSaving] = useState(false)
  const [newFlowerForm, setNewFlowerForm] = useState("")
  const [newGeneration, setNewGeneration] = useState("")

  async function addFlowerForm() {
    if (!newFlowerForm.trim()) return
    const current = species.flowerFormOptions || []
    const result = await updateSpecies(species.id, { flowerFormOptions: [...current, newFlowerForm.trim()] })
    if (!result.success) { toast.error(result.error); return }
    setNewFlowerForm("")
    toast.success("Flower form added")
    router.refresh()
  }

  async function removeFlowerForm(index: number) {
    const current = species.flowerFormOptions || []
    const result = await updateSpecies(species.id, { flowerFormOptions: current.filter((_: any, i: number) => i !== index) })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Flower form removed")
    router.refresh()
  }

  async function addGeneration() {
    if (!newGeneration.trim()) return
    const current = species.generationLabels || []
    const result = await updateSpecies(species.id, { generationLabels: [...current, newGeneration.trim()] })
    if (!result.success) { toast.error(result.error); return }
    setNewGeneration("")
    toast.success("Generation label added")
    router.refresh()
  }

  async function removeGeneration(index: number) {
    const current = species.generationLabels || []
    const result = await updateSpecies(species.id, { generationLabels: current.filter((_: any, i: number) => i !== index) })
    if (!result.success) { toast.error(result.error); return }
    toast.success("Generation label removed")
    router.refresh()
  }

  async function handleAddTrait() {
    setSaving(true)
    try {
      const result = await createTrait({
        speciesId: species.id,
        name: traitForm.name,
        slug: traitForm.slug.toLowerCase().replace(/\s+/g, "-"),
        description: traitForm.description || undefined,
        type: traitForm.type,
        category: traitForm.category,
      })
      if (!result.success) { toast.error(result.error); return }
      toast.success("Trait added")
      setTraitOpen(false)
      setTraitForm({ name: "", slug: "", type: "SCALE_1_10", category: "General", description: "" })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTrait(id: string) {
    const result = await deleteTrait(id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Trait deleted")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Species", href: "/species" }, { label: species.name }]} />
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Flower2 className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{species.name}</h1>
          <p className="text-sm text-muted-foreground">{species.slug}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
          </Button>
          <ConfirmDialog title="Delete species?" description="This will permanently remove this species and all associated data." onConfirm={handleDeleteSpecies}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </Button>
          </ConfirmDialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Traits</p><p className="text-lg font-semibold mt-1">{traits.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Generations</p><p className="text-lg font-semibold mt-1">{species.generationLabels?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Flower Forms</p><p className="text-lg font-semibold mt-1">{species.flowerFormOptions?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pollen Viability</p><p className="text-lg font-semibold mt-1">{species.pollenViability ?? 100}%</p></CardContent></Card>
      </div>

      <Tabs defaultValue="traits">
        <TabsList>
          <TabsTrigger value="traits">Traits</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="traits" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Define the traits that can be scored for this species</p>
            <Dialog open={traitOpen} onOpenChange={setTraitOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="mr-2 size-4" />Add Trait
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Trait</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleAddTrait() }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trait-name">Name *</Label>
                    <Input id="trait-name" value={traitForm.name} onChange={(e) => setTraitForm({ ...traitForm, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trait-slug">Slug *</Label>
                    <Input id="trait-slug" value={traitForm.slug} onChange={(e) => setTraitForm({ ...traitForm, slug: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={traitForm.type} onValueChange={(v) => setTraitForm({ ...traitForm, type: v ?? "SCALE_1_10" })}>
                      <SelectTrigger><SelectValue>{["SCALE_1_5", "SCALE_1_10", "BOOLEAN", "TEXT", "PERCENTAGE"].find(v => v === traitForm.type)}</SelectValue></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SCALE_1_5">Scale 1-5</SelectItem>
                        <SelectItem value="SCALE_1_10">Scale 1-10</SelectItem>
                        <SelectItem value="BOOLEAN">Yes/No</SelectItem>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trait-category">Category</Label>
                    <Input id="trait-category" value={traitForm.category} onChange={(e) => setTraitForm({ ...traitForm, category: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    {saving ? "Saving..." : "Add Trait"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {traits.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No traits defined yet</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {traits.map((trait: any) => (
                <Card key={trait.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <GripVertical className="size-4 text-muted-foreground/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{trait.name}</p>
                      <p className="text-xs text-muted-foreground">{trait.slug} · {trait.type} · {trait.category}</p>
                    </div>
                    <Badge variant="secondary">{trait.category}</Badge>
                    <ConfirmDialog
                      title="Delete trait?"
                      description="This will permanently remove this trait and all associated data. This action cannot be undone."
                      onConfirm={() => handleDeleteTrait(trait.id)}
                    >
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </ConfirmDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-6 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Flower Forms</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newFlowerForm} onChange={(e) => setNewFlowerForm(e.target.value)} placeholder="e.g. Double, Cupped, Rosette..." />
                <Button onClick={addFlowerForm} variant="outline" size="sm"><Plus className="size-4" /></Button>
              </div>
              {(!species.flowerFormOptions || species.flowerFormOptions.length === 0) ? (
                <p className="text-sm text-muted-foreground">No flower forms configured</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {species.flowerFormOptions.map((f: string, i: number) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      {f}
                      <button onClick={() => removeFlowerForm(i)} className="text-muted-foreground hover:text-foreground ml-1">&times;</button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Generation Labels</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newGeneration} onChange={(e) => setNewGeneration(e.target.value)} placeholder="e.g. F1, F2, BC1..." />
                <Button onClick={addGeneration} variant="outline" size="sm"><Plus className="size-4" /></Button>
              </div>
              {(!species.generationLabels || species.generationLabels.length === 0) ? (
                <p className="text-sm text-muted-foreground">No generation labels configured</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {species.generationLabels.map((g: string, i: number) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {g}
                      <button onClick={() => removeGeneration(i)} className="text-muted-foreground hover:text-foreground ml-1">&times;</button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Breeding Terminology</CardTitle></CardHeader>
            <CardContent>
              {species.breedingTerminology ? (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(species.breedingTerminology).map(([key, value]: any) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Using defaults</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Species</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pollenViability">Pollen Viability (%)</Label>
                <Input id="edit-pollenViability" type="number" min="0" max="100" value={editForm.pollenViability} onChange={(e) => setEditForm({ ...editForm, pollenViability: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-seedViability">Seed Viability (%)</Label>
                <Input id="edit-seedViability" type="number" min="0" max="100" value={editForm.seedViability} onChange={(e) => setEditForm({ ...editForm, seedViability: e.target.value })} />
              </div>
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
