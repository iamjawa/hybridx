"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitMerge, Plus } from "lucide-react"
import Link from "next/link"
import { getCrosses, createCross } from "@/server/actions/crosses"
import { useRouter } from "next/navigation"

export function CrossesClient({ initialCrosses, total, species, plants }: any) {
  const router = useRouter()
  const [crosses, setCrosses] = useState(initialCrosses)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ speciesId: "", seedParentId: "", pollenParentId: "", crossNumber: "", method: "MANUAL", notes: "" })

  async function handleCreate() {
    await createCross({
      speciesId: form.speciesId || undefined,
      seedParentId: form.seedParentId || undefined,
      pollenParentId: form.pollenParentId || undefined,
      crossNumber: form.crossNumber || undefined,
      method: form.method,
      notes: form.notes || undefined,
    })
    setOpen(false)
    setForm({ speciesId: "", seedParentId: "", pollenParentId: "", crossNumber: "", method: "MANUAL", notes: "" })
    const result = await getCrosses()
    setCrosses(result.crosses)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Crosses</h1>
          <p className="text-sm text-muted-foreground">{total} crosses recorded</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 size-4" />
            New Cross
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Plan a New Cross</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
              <div className="space-y-2">
                <Label>Species</Label>
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
                <Label>Seed Parent (♀)</Label>
                <Select value={form.seedParentId} onValueChange={(v) => setForm({ ...form, seedParentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select seed parent" /></SelectTrigger>
                  <SelectContent>
                    {plants.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pollen Parent (♂)</Label>
                <Select value={form.pollenParentId} onValueChange={(v) => setForm({ ...form, pollenParentId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Select pollen parent" /></SelectTrigger>
                  <SelectContent>
                    {plants.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crossNumber">Cross Number</Label>
                <Input id="crossNumber" value={form.crossNumber} onChange={(e) => setForm({ ...form, crossNumber: e.target.value })} placeholder="e.g. 2024-001" />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v ?? "MANUAL" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="BAG">Bag</SelectItem>
                    <SelectItem value="CAGE">Cage</SelectItem>
                    <SelectItem value="ISOLATION">Isolation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Cross</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {crosses.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-4 py-16">
          <GitMerge className="size-12 text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-lg font-medium">No crosses yet</p>
            <p className="text-sm text-muted-foreground">Plan your first cross to start your breeding programme.</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crosses.map((cross: any) => (
            <Link key={cross.id} href={`/crosses/${cross.id}`}>
              <Card className="h-full transition-colors hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {cross.seedParent?.name ?? "?"} <span className="text-muted-foreground">×</span> {cross.pollenParent?.name ?? "?"}
                      </p>
                      {cross.crossNumber && (
                        <p className="text-sm text-muted-foreground">{cross.crossNumber}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cross.species && <Badge variant="secondary">{cross.species.name}</Badge>}
                    {cross.pollinationDate ? <Badge variant="outline">Pollinated</Badge> : <Badge variant="outline">Planned</Badge>}
                    <Badge variant="outline">{cross.seedlings?.length ?? 0} seedlings</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
