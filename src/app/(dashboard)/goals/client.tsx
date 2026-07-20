"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Target, Plus, Trash2, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { createGoal, getGoals } from "@/server/actions/goals"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"

export function GoalsClient({ goals: initialGoals, species }: any) {
  const router = useRouter()
  const [goals, setGoals] = useState(initialGoals)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", speciesId: "",
    criteria: [] as { traitName: string; targetValue: string; weight: string; type: string; operator: string }[],
  })
  const [saving, setSaving] = useState(false)

  function addCriterion() {
    setForm({ ...form, criteria: [...form.criteria, { traitName: "", targetValue: "", weight: "25", type: "TEXT", operator: "equals" }] })
  }

  function updateCriterion(i: number, field: string, value: string) {
    const c = [...form.criteria]; (c[i] as any)[field] = value; setForm({ ...form, criteria: c })
  }

  function removeCriterion(i: number) {
    setForm({ ...form, criteria: form.criteria.filter((_, idx) => idx !== i) })
  }

  async function handleCreate() {
    setSaving(true)
    try {
      const criteria = form.criteria.map((c) => ({
        traitName: c.traitName,
        targetValue: isNaN(Number(c.targetValue)) ? c.targetValue : Number(c.targetValue),
        weight: parseInt(c.weight) || 25,
        type: c.type,
        operator: c.operator as any,
      }))
      const result = await createGoal({
        name: form.name,
        description: form.description || undefined,
        speciesId: form.speciesId || undefined,
        criteria,
      })
      if (!result.success) { toast.error(result.error); return }
      toast.success("Breeding goal created")
      setOpen(false)
      setForm({ name: "", description: "", speciesId: "", criteria: [] })
      const g = await getGoals()
      setGoals(g)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Breeding Goals</h1>
          <p className="text-sm text-muted-foreground">Define objectives and find your best matches</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 size-4" />
            New Goal
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Breeding Goal</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Name *</Label>
                <Input id="goal-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Fragrant orange Hybrid Tea" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-desc">Description</Label>
                <Textarea id="goal-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the ideal variety you're breeding for" />
              </div>
              <div className="space-y-2">
                <Label>Species</Label>
                <Select value={form.speciesId} onValueChange={(v) => setForm({ ...form, speciesId: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="Any species" /></SelectTrigger>
                  <SelectContent>
                    {species.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Target Traits</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                    <Plus className="mr-1 size-3" />Add Trait
                  </Button>
                </div>
                {form.criteria.length === 0 && (
                  <p className="text-xs text-muted-foreground">Add at least one trait to define your goal</p>
                )}
                {form.criteria.map((c, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Trait {i + 1}</span>
                      <Button type="button" variant="ghost" size="icon" className="size-6" onClick={() => removeCriterion(i)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Trait name (e.g. Colour)" value={c.traitName} onChange={(e) => updateCriterion(i, "traitName", e.target.value)} />
                      <Input placeholder="Target value" value={c.targetValue} onChange={(e) => updateCriterion(i, "targetValue", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={c.type} onValueChange={(v) => updateCriterion(i, "type", v ?? "TEXT")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="SCALE_1_5">Scale 1-5</SelectItem>
                          <SelectItem value="SCALE_1_10">Scale 1-10</SelectItem>
                          <SelectItem value="BOOLEAN">Yes/No</SelectItem>
                          <SelectItem value="NUMERIC">Numeric</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={c.operator} onValueChange={(v) => updateCriterion(i, "operator", v ?? "equals")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="gte">≥</SelectItem>
                          <SelectItem value="lte">≤</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Input type="number" min="1" max="100" value={c.weight} onChange={(e) => updateCriterion(i, "weight", e.target.value)} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={saving || form.criteria.length === 0}>
                {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Create Goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search goals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {(() => {
        const filtered = goals.filter((g: any) => !search || g.name.toLowerCase().includes(search.toLowerCase()))
        return filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No breeding goals"
          description="Breeding goals help you find your best plants and seedlings. Define what you're breeding for and HybridX will score every plant against your criteria."
          action={
            <Dialog>
              <DialogTrigger render={<Button />}><Plus className="mr-2 size-4" />Create Your First Goal</DialogTrigger>
            </Dialog>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((goal: any) => (
            <Link key={goal.id} href={`/goals/${goal.id}`}>
              <Card className="h-full transition-colors hover:border-border/80">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Target className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{goal.name}</h3>
                      {goal.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{goal.description}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {goal.species && <Badge variant="secondary">{goal.species.name}</Badge>}
                    <Badge variant="outline">{Array.isArray(goal.criteria) ? goal.criteria.length : 0} traits</Badge>
                    <Badge variant="outline">{goal._count?.scores ?? 0} matches</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )})()}
    </div>
  )
}
