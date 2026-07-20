"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flower2, Plus, Trash2, GripVertical, Loader2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { createTrait, deleteTrait, updateSpecies } from "@/server/actions/species"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SpeciesDetailClient({ species }: any) {
  const router = useRouter()
  const [traits, setTraits] = useState(species.traits || [])
  const [traitOpen, setTraitOpen] = useState(false)
  const [traitForm, setTraitForm] = useState({ name: "", slug: "", type: "SCALE_1_10", category: "General", description: "" })
  const [saving, setSaving] = useState(false)

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
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <Flower2 className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{species.name}</h1>
          <p className="text-sm text-muted-foreground">{species.slug}</p>
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
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
            <CardHeader><CardTitle className="text-base">Generation Labels</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {species.generationLabels?.map((g: string, i: number) => (
                  <Badge key={i} variant="secondary">{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Flower Forms</CardTitle></CardHeader>
            <CardContent>
              {species.flowerFormOptions?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No flower forms configured</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {species.flowerFormOptions?.map((f: string, i: number) => (
                    <Badge key={i} variant="outline">{f}</Badge>
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
    </div>
  )
}
