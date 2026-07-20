"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPlant } from "@/server/actions/plants"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export function PlantNewClient({ species }: any) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", varietyName: "", speciesId: "", description: "", origin: "", year: "", colour: "", fragrance: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await createPlant({
      name: form.name,
      varietyName: form.varietyName || undefined,
      speciesId: form.speciesId || undefined,
      description: form.description || undefined,
      origin: form.origin || undefined,
      year: form.year ? parseInt(form.year) : undefined,
      colour: form.colour || undefined,
      fragrance: form.fragrance || undefined,
    })
    setSaving(false)
    if (result.success) router.push("/plants")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plants" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Plant</h1>
          <p className="text-sm text-muted-foreground">Add a new plant to your collection</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Plant Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="varietyName">Variety Name</Label>
              <Input id="varietyName" value={form.varietyName} onChange={(e) => setForm({ ...form, varietyName: e.target.value })} />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="colour">Colour</Label>
                <Input id="colour" value={form.colour} onChange={(e) => setForm({ ...form, colour: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fragrance">Fragrance</Label>
                <Input id="fragrance" value={form.fragrance} onChange={(e) => setForm({ ...form, fragrance: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Create Plant"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
