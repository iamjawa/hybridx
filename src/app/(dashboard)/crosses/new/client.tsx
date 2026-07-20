"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createCross } from "@/server/actions/crosses"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export function CrossNewClient({ species, plants, defaultSeedParentId, defaultPollenParentId }: any) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    speciesId: "",
    seedParentId: defaultSeedParentId ?? "",
    pollenParentId: defaultPollenParentId ?? "",
    crossNumber: "",
    method: "MANUAL",
    plannedDate: "",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await createCross({
      speciesId: form.speciesId || undefined,
      seedParentId: form.seedParentId || undefined,
      pollenParentId: form.pollenParentId || undefined,
      crossNumber: form.crossNumber || undefined,
      method: form.method,
      plannedDate: form.plannedDate ? new Date(form.plannedDate) : undefined,
      notes: form.notes || undefined,
    })
    setSaving(false)
    if (result.success) router.push("/crosses")
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/crosses" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plan Cross</h1>
          <p className="text-sm text-muted-foreground">Record a new cross between two plants</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Cross Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Select value={form.speciesId} onValueChange={(v) => setForm({ ...form, speciesId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select species">{species.find((s: any) => s.id === form.speciesId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {species.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v ?? "MANUAL" })}>
                  <SelectTrigger><SelectValue>{["MANUAL", "OPEN", "BAG", "CAGE", "ISOLATION"].find(v => v === form.method)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="BAG">Bag</SelectItem>
                    <SelectItem value="CAGE">Cage</SelectItem>
                    <SelectItem value="ISOLATION">Isolation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seedParent">Seed Parent</Label>
                <Select value={form.seedParentId} onValueChange={(v) => setForm({ ...form, seedParentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select parent">{plants.find((p: any) => p.id === form.seedParentId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {plants.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pollenParent">Pollen Parent</Label>
                <Select value={form.pollenParentId} onValueChange={(v) => setForm({ ...form, pollenParentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select parent">{plants.find((p: any) => p.id === form.pollenParentId)?.name}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {plants.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crossNumber">Cross Number</Label>
                <Input id="crossNumber" value={form.crossNumber} onChange={(e) => setForm({ ...form, crossNumber: e.target.value })} placeholder="e.g. R-AB-24" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedDate">Planned Date</Label>
                <Input id="plannedDate" type="date" value={form.plannedDate} onChange={(e) => setForm({ ...form, plannedDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Create Cross"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
