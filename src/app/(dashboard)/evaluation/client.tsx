"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, Search, Sprout } from "lucide-react"
import Link from "next/link"
import { createEvaluation } from "@/server/actions/seedlings"
import { useRouter } from "next/navigation"

export function EvaluationClient({ seedlings: initialSeedlings, species }: any) {
  const router = useRouter()
  const [seedlings, setSeedlings] = useState(initialSeedlings)
  const [search, setSearch] = useState("")
  const [evalOpen, setEvalOpen] = useState<string | null>(null)
  const [evalForm, setEvalForm] = useState({ systemName: "Standard", scores: "{}", totalScore: "", notes: "" })

  async function handleEvaluate(seedlingId: string) {
    await createEvaluation({
      seedlingId,
      systemName: evalForm.systemName,
      criteria: {},
      scores: JSON.parse(evalForm.scores || "{}"),
      totalScore: evalForm.totalScore ? parseFloat(evalForm.totalScore) : undefined,
      notes: evalForm.notes || undefined,
    })
    setEvalOpen(null)
    setEvalForm({ systemName: "Standard", scores: "{}", totalScore: "", notes: "" })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Evaluation</h1>
        <p className="text-sm text-muted-foreground">Score and evaluate seedlings</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search seedlings to evaluate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {seedlings.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-4 py-16">
          <Star className="size-12 text-muted-foreground/40" />
          <div className="text-center">
            <p className="text-lg font-medium">No seedlings to evaluate</p>
            <p className="text-sm text-muted-foreground">Add seedlings first, then evaluate them here.</p>
          </div>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {seedlings
            .filter((s: any) => !search || s.seedlingId.toLowerCase().includes(search.toLowerCase()))
            .map((s: any) => (
              <Card key={s.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Sprout className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/seedlings/${s.id}`} className="text-sm font-medium hover:text-primary">
                        {s.seedlingId}
                      </Link>
                      {s.evaluations?.[0]?.totalScore != null && (
                        <Badge variant="secondary">{s.evaluations[0].totalScore}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.cross?.seedParent?.name ?? "?"} × {s.cross?.pollenParent?.name ?? "?"}
                    </p>
                  </div>
                  {s.disposition && <Badge variant="outline">{s.disposition}</Badge>}
                  <Dialog open={evalOpen === s.id} onOpenChange={(open) => setEvalOpen(open ? s.id : null)}>
                    <DialogTrigger render={<Button variant="outline" size="sm" />}>
                      <Star className="mr-2 size-4" />
                      Evaluate
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Evaluate {s.seedlingId}</DialogTitle></DialogHeader>
                      <form onSubmit={(e) => { e.preventDefault(); handleEvaluate(s.id) }} className="space-y-4">
                        <div className="space-y-2">
                          <Label>System</Label>
                          <Select value={evalForm.systemName} onValueChange={(v) => setEvalForm({ ...evalForm, systemName: v ?? "Standard" })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Detailed">Detailed</SelectItem>
                              <SelectItem value="Blind">Blind</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="score">Total Score (0-10)</Label>
                          <Input id="score" type="number" min="0" max="10" step="0.1" value={evalForm.totalScore} onChange={(e) => setEvalForm({ ...evalForm, totalScore: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eval-notes">Notes</Label>
                          <Textarea id="eval-notes" value={evalForm.notes} onChange={(e) => setEvalForm({ ...evalForm, notes: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full">Save Evaluation</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
