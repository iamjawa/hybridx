"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitMerge, Sprout, Calendar, Hash, Database, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { createSeed } from "@/server/actions/seeds"
import { updateCross, deleteCross } from "@/server/actions/crosses"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export function CrossDetailClient({ cross }: any) {
  const router = useRouter()

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    crossNumber: cross.crossNumber ?? "",
    plannedDate: cross.plannedDate ? new Date(cross.plannedDate).toISOString().split("T")[0] : "",
    method: cross.method ?? "",
    notes: cross.notes ?? "",
    seedCount: cross.seedCount?.toString() ?? "",
    isolation: cross.isolation ?? "",
    weather: cross.weather ?? "",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleEdit() {
    setSavingEdit(true)
    const result = await updateCross(cross.id, {
      ...editForm,
      plannedDate: editForm.plannedDate ? new Date(editForm.plannedDate) : undefined,
      seedCount: editForm.seedCount ? parseInt(editForm.seedCount) : undefined,
    })
    setSavingEdit(false)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Cross updated")
    setEditOpen(false)
    router.refresh()
  }

  async function handleDeleteCross() {
    const result = await deleteCross(cross.id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Cross deleted")
    router.push("/crosses")
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Crosses", href: "/crosses" }, { label: cross.crossNumber ?? `${cross.seedParent?.name ?? "?"} × ${cross.pollenParent?.name ?? "?"}` }]} />
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <GitMerge className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {cross.seedParent?.name ?? "?"} <span className="text-muted-foreground">×</span> {cross.pollenParent?.name ?? "?"}
            </h1>
            {cross.pollinationDate && <Badge>Pollinated</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {cross.crossNumber ?? "No number"}{cross.species ? ` · ${cross.species.name}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
        </Button>
        <ConfirmDialog title="Delete cross?" description="This will permanently remove this cross and all associated data." onConfirm={handleDeleteCross}>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </ConfirmDialog>
        <Button
          variant="outline" size="sm"
          onClick={async () => {
            const result = await createSeed({
              crossId: cross.id,
              speciesId: cross.speciesId,
              batchNumber: `${cross.crossNumber ?? "BATCH"}-B1`,
              totalCount: 0,
              notes: cross.notes ? `From cross: ${cross.notes}` : undefined,
            })
            if (!result.success) { toast.error(result.error); return }
            toast.success("Seed batch created")
            router.refresh()
          }}
        >
          <Database className="mr-1.5 size-3.5" />
          Record Seeds
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Calendar className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Planned</p><p className="text-sm font-medium">{cross.plannedDate ? new Date(cross.plannedDate).toLocaleDateString() : "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Calendar className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Pollinated</p><p className="text-sm font-medium">{cross.pollinationDate ? new Date(cross.pollinationDate).toLocaleDateString() : "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Hash className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Method</p><p className="text-sm font-medium">{cross.method}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4">
          <Sprout className="size-4 text-muted-foreground" />
          <div><p className="text-xs text-muted-foreground">Seedlings</p><p className="text-sm font-medium">{cross.seedlings?.length ?? 0}</p></div>
        </CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Seed Parent (♀)</p>
          <Link href={`/plants/${cross.seedParent?.id}`} className="mt-1 block text-sm font-medium hover:text-primary">
            {cross.seedParent?.name ?? "Unknown"}
          </Link>
          {cross.seedParent?.species && <p className="text-xs text-muted-foreground">{cross.seedParent.species.name}</p>}
        </CardContent></Card>
        <Card className="flex-1"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Pollen Parent (♂)</p>
          <Link href={`/plants/${cross.pollenParent?.id}`} className="mt-1 block text-sm font-medium hover:text-primary">
            {cross.pollenParent?.name ?? "Unknown"}
          </Link>
          {cross.pollenParent?.species && <p className="text-xs text-muted-foreground">{cross.pollenParent.species.name}</p>}
        </CardContent></Card>
      </div>

      <Tabs defaultValue="seedlings">
        <TabsList>
          <TabsTrigger value="seedlings">Seedlings</TabsTrigger>
          <TabsTrigger value="pollinations">Pollinations</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="seedlings" className="mt-6">
          {cross.seedlings?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No seedlings yet from this cross</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cross.seedlings.map((s: any) => (
                <Link key={s.id} href={`/seedlings/${s.id}`}>
                  <Card className="transition-colors hover:border-border/80">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium">{s.seedlingId}</p>
                      <p className="text-xs text-muted-foreground">Year {s.year}</p>
                      {s.disposition && <Badge variant="secondary" className="mt-2">{s.disposition}</Badge>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pollinations" className="mt-6">
          {cross.pollinations?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No pollinations recorded</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {cross.pollinations.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">Pollinated on <strong>{new Date(p.pollinationDate).toLocaleDateString()}</strong></p>
                      <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                        {p.method && <span>Method: {p.method}</span>}
                        {p.weather && <span>· Weather: {p.weather}</span>}
                        {p.tagNumber && <span>· Tag: {p.tagNumber}</span>}
                      </div>
                    </div>
                    {p.pollinatedBy && <p className="text-xs text-muted-foreground">{p.pollinatedBy.name}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          {cross.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{cross.notes}</p></CardContent>
            </Card>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {cross.seedCount != null && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Seed Count</p><p className="text-sm font-medium">{cross.seedCount}</p></CardContent></Card>}
            {cross.isolation && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Isolation</p><p className="text-sm font-medium">{cross.isolation}</p></CardContent></Card>}
            {cross.weather && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Weather</p><p className="text-sm font-medium">{cross.weather}</p></CardContent></Card>}
            {cross.pollenStorage && <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pollen Storage</p><p className="text-sm font-medium">{cross.pollenStorage}</p></CardContent></Card>}
          </div>
          {cross.seeds?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Seed Batches</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cross.seeds.map((seed: any) => (
                    <Link key={seed.id} href={`/seeds/${seed.id}`} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                      <Database className="size-4 text-muted-foreground" />
                      <span className="text-sm">{seed.batchNumber ?? "Unnamed batch"}</span>
                      <span className="text-xs text-muted-foreground">{seed.totalCount} seeds</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Cross</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-crossNumber">Cross Number</Label>
              <Input id="edit-crossNumber" value={editForm.crossNumber} onChange={(e) => setEditForm({ ...editForm, crossNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-plannedDate">Planned Date</Label>
              <Input id="edit-plannedDate" type="date" value={editForm.plannedDate} onChange={(e) => setEditForm({ ...editForm, plannedDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={editForm.method} onValueChange={(v) => setEditForm({ ...editForm, method: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="CONTROLLED">Controlled</SelectItem>
                  <SelectItem value="HAND">Hand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-seedCount">Seed Count</Label>
                <Input id="edit-seedCount" type="number" value={editForm.seedCount} onChange={(e) => setEditForm({ ...editForm, seedCount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isolation">Isolation</Label>
                <Input id="edit-isolation" value={editForm.isolation} onChange={(e) => setEditForm({ ...editForm, isolation: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-weather">Weather</Label>
              <Input id="edit-weather" value={editForm.weather} onChange={(e) => setEditForm({ ...editForm, weather: e.target.value })} />
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
