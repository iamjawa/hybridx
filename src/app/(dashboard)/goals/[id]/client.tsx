"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Leaf, Sprout, RefreshCw, Trash2 } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import Link from "next/link"
import { runGoalMatching, deleteGoal, getGoalById } from "@/server/actions/goals"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
    score >= 60 ? "border-blue-500/30 bg-blue-500/10 text-blue-500" :
    score >= 40 ? "border-amber-500/30 bg-amber-500/10 text-amber-500" :
    "border-red-500/30 bg-red-500/10 text-red-500"
  return <Badge className={color} variant="outline">{score}%</Badge>
}

export function GoalDetailClient({ goal: initialGoal }: any) {
  const router = useRouter()
  const [goal, setGoal] = useState(initialGoal)
  const [running, setRunning] = useState(false)

  async function handleRunMatching(entityType: "plant" | "seedling") {
    setRunning(true)
    const result = await runGoalMatching(goal.id, entityType)
    if (!result.success) { toast.error(result.error); setRunning(false); return }
    toast.success(`Matched ${result.data?.scored ?? 0} ${entityType}s`)
    const updated = await getGoalById(goal.id)
    if (updated) setGoal(updated)
    setRunning(false)
    router.refresh()
  }

  async function handleDelete() {
    const result = await deleteGoal(goal.id)
    if (!result.success) { toast.error(result.error); return }
    toast.success("Goal deleted")
    router.push("/goals")
  }

  const criteria = Array.isArray(goal.criteria) ? goal.criteria : []
  const sortedScores = [...(goal.scores ?? [])].sort((a: any, b: any) => b.overallScore - a.overallScore)

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Goals", href: "/goals" }, { label: goal.name }]} />
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Target className="size-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{goal.name}</h1>
            {goal.species && <Badge variant="secondary">{goal.species.name}</Badge>}
          </div>
          {goal.description && <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>}
        </div>
        <ConfirmDialog
          title="Delete goal?"
          description="This will permanently remove this goal and all associated scores. This action cannot be undone."
          onConfirm={handleDelete}
        >
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </ConfirmDialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Target Traits</p>
          <p className="text-lg font-semibold mt-1">{criteria.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Plants Scored</p>
          <p className="text-lg font-semibold mt-1">{goal.scores?.filter((s: any) => s.plantId).length ?? 0}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Seedlings Scored</p>
          <p className="text-lg font-semibold mt-1">{goal.scores?.filter((s: any) => s.seedlingId).length ?? 0}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Traits & Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criteria.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.traitName}</p>
                  <p className="text-xs text-muted-foreground">Target: {String(c.targetValue)} · {c.type}{c.operator !== "equals" ? ` · ${c.operator}` : ""}</p>
                </div>
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <Progress value={c.weight} className="h-2" />
                    <span className="text-xs font-medium w-8 text-right">{c.weight}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => handleRunMatching("plant")} disabled={running} variant="outline">
          <Leaf className="mr-2 size-4" />
          {running ? "Matching..." : "Match Plants"}
        </Button>
        <Button onClick={() => handleRunMatching("seedling")} disabled={running} variant="outline">
          <Sprout className="mr-2 size-4" />
          {running ? "Matching..." : "Match Seedlings"}
        </Button>
      </div>

      <Tabs defaultValue="matched">
        <TabsList>
          <TabsTrigger value="matched">Best Matches</TabsTrigger>
          <TabsTrigger value="criteria">All by Trait</TabsTrigger>
        </TabsList>

        <TabsContent value="matched" className="mt-6">
          {sortedScores.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Target className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No matches yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Run matching to score plants and seedlings against this goal</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {sortedScores.slice(0, 20).map((score: any) => {
                const entity = score.plant ?? score.seedling
                const type = score.plantId ? "plant" : "seedling"
                const href = type === "plant" ? `/plants/${score.plantId}` : `/seedlings/${score.seedlingId}`
                return (
                  <Link key={score.id} href={href}>
                    <Card className="transition-colors hover:border-border/80">
                      <CardContent className="flex items-center gap-4 p-4">
                        {type === "plant" ? <Leaf className="size-5 text-emerald-500" /> : <Sprout className="size-5 text-blue-500" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {score.plant?.name ?? score.seedling?.seedlingId ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {score.seedling?.cross?.seedParent?.name ? `${score.seedling.cross.seedParent.name} × ${score.seedling.cross.pollenParent?.name}` : score.plant?.species?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <ScoreBadge score={score.overallScore} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="criteria" className="mt-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                The goal matching engine scores each plant or seedling against your target traits.
                Each trait is scored independently (0-100) then weighted by the percentage you assigned.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                <li>Text traits: exact match = 100%, partial match = 80%, no match = 0%</li>
                <li>Scale traits: scored by proximity to target value</li>
                <li>Boolean traits: exact match = 100%</li>
                <li>Operators: ≥ and ≤ allow threshold-based matching</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
