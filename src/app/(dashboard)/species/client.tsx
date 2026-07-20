"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Flower2, Plus } from "lucide-react"
import Link from "next/link"
import { createSpecies } from "@/server/actions/species"
import { useRouter } from "next/navigation"

export function SpeciesClient({ species }: any) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", description: "" })

  async function handleCreate() {
    await createSpecies({
      name: form.name,
      slug: form.slug.toLowerCase().replace(/\s+/g, "-"),
      description: form.description || undefined,
    })
    setOpen(false)
    setForm({ name: "", slug: "", description: "" })
    router.refresh()
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
              <Button type="submit" className="w-full">Create Species</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {species.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-4 py-16">
          <Flower2 className="size-12 text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-lg font-medium">No species configured</p>
            <p className="text-sm text-muted-foreground">Add your first species to define traits and breeding parameters.</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {species.map((s: any) => (
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
      )}
    </div>
  )
}
