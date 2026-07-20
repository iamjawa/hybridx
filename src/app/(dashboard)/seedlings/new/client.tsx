"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSeedling } from "@/server/actions/seedlings"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export function SeedlingNewClient({ species, crosses }: any) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    seedlingId: "",
    year: new Date().getFullYear().toString(),
    crossId: "",
    speciesId: "",
    generation: "F1",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await createSeedling({
      seedlingId: form.seedlingId,
      year: parseInt(form.year),
      crossId: form.crossId || undefined,
      speciesId: form.speciesId || undefined,
      generation: form.generation || undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    if (result.success) router.push("/seedlings")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/seedlings" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Seedling</h1>
          <p className="text-sm text-muted-foreground">Register a new seedling from a cross</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Seedling Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seedlingId">Seedling ID *</Label>
                <Input id="seedlingId" value={form.seedlingId} onChange={(e) => setForm({ ...form, seedlingId: e.target.value })} required placeholder="e.g. R-AB-A-24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="generation">Generation</Label>
                <Select value={form.generation} onValueChange={(v) => setForm({ ...form, generation: v ?? "F1" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F1">F1</SelectItem>
                    <SelectItem value="F2">F2</SelectItem>
                    <SelectItem value="F3">F3</SelectItem>
                    <SelectItem value="F4">F4</SelectItem>
                    <SelectItem value="F5">F5</SelectItem>
                    <SelectItem value="BC1">BC1</SelectItem>
                    <SelectItem value="BC2">BC2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cross">Cross</Label>
              <Select value={form.crossId} onValueChange={(v) => setForm({ ...form, crossId: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select cross" /></SelectTrigger>
                <SelectContent>
                  {crosses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.crossNumber || `${c.seedParent?.name ?? "?"} × ${c.pollenParent?.name ?? "?"}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Create Seedling"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
