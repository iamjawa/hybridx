"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Flower2, Plus, Loader2, Search } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"
import { createSpecies } from "@/server/actions/species"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SpeciesClient({ species }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ name: "", slug: "", description: "", generationLabels: "", flowerFormOptions: "" })
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    setSaving(true)
    try {
      const result = await createSpecies({
        name: form.name,
        slug: form.slug.toLowerCase().replace(/\s+/g, "-"),
        description: form.description || undefined,
        generationLabels: form.generationLabels ? form.generationLabels.split(",").map(s => s.trim()) : undefined,
        flowerFormOptions: form.flowerFormOptions ? form.flowerFormOptions.split(",").map(s => s.trim()) : undefined,
      })
      if (!result.success) { toast.error(result.error); return }
      toast.success("Species created")
      setOpen(false)
      setForm({ name: "", slug: "", description: "", generationLabels: "", flowerFormOptions: "" })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Species</h1>
          <p className="text-sm text-muted-foreground">{species.length} species configured</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 size-4" />
            Add Species
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Species</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. rosa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Generation Labels (comma-separated)</Label>
                <Input value={form.generationLabels} onChange={(e) => setForm({ ...form, generationLabels: e.target.value })} placeholder="F1, F2, F3, BC1, BC2" />
              </div>
              <div className="space-y-2">
                <Label>Flower Forms (comma-separated)</Label>
                <Input value={form.flowerFormOptions} onChange={(e) => setForm({ ...form, flowerFormOptions: e.target.value })} placeholder="Single, Double, Cupped..." />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Create Species"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search species..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Escape" && (setSearch(""), e.currentTarget.blur())} className="pl-9" />
      </div>

      {(() => {
        const filtered = species.filter((s: any) => !search || s.name.toLowerCase().includes(search.toLowerCase()))
        return filtered.length === 0 ? (
        <EmptyState
          icon={Flower2}
          title="No species configured"
          description="Configure your breeding species to define traits, generation labels, and flower forms. Species are the foundation of your breeding programme."
          action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 size-4" />Add Species</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s: any) => (
            <Link key={s.id} href={`/species/${s.id}`}>
              <Card className="h-full transition-colors hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Flower2 className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.slug}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{s.traits?.length ?? 0} traits</Badge>
                    <Badge variant="outline">{s.generationLabels?.length ?? 0} generations</Badge>
                    <Badge variant="outline">{s.flowerFormOptions?.length ?? 0} forms</Badge>
                  </div>
                  {s.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )})()}
    </div>
  )
}
