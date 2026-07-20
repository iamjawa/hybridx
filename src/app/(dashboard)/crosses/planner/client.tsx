"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitMerge, Leaf, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { compareParents } from "@/server/actions/cross-planner"
import { toast } from "sonner"

export function CrossPlannerClient({ plants }: any) {
  const [seedId, setSeedId] = useState("")
  const [pollenId, setPollenId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function handleCompare() {
    if (!seedId || !pollenId) { toast.error("Select both parents"); return }
    if (seedId === pollenId) { toast.error("Parents must be different plants"); return }
    setLoading(true)
    const data = await compareParents(seedId, pollenId)
    setResult(data)
    setLoading(false)
  }

  function reset() {
    setSeedId("")
    setPollenId("")
    setResult(null)
  }

  if (result) {
    const c = result.comparison
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Cross Comparison</h1>
            <p className="text-sm text-muted-foreground">Trait compatibility between selected parents</p>
          </div>
          <Button variant="outline" onClick={reset}>New Comparison</Button>
        </div>

        <div className="flex items-center justify-center gap-6 py-4">
          <Link href={`/plants/${result.seedParent.id}`} className="text-center">
            <div className="flex size-14 items-center justify-center rounded-xl bg-rose-500/10 mx-auto">
              <Leaf className="size-6 text-rose-500" />
            </div>
            <p className="mt-2 font-medium text-sm">{result.seedParent.name}</p>
            <p className="text-xs text-muted-foreground">Seed Parent (♀)</p>
          </Link>
          <div className="flex flex-col items-center">
            <ArrowRight className="size-8 text-muted-foreground" />
            <Badge className={`mt-1 ${c.compatibilityScore >= 70 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-amber-500/30 bg-amber-500/10 text-amber-500"}`} variant="outline">
              {c.compatibilityScore}% Compatible
            </Badge>
          </div>
          <Link href={`/plants/${result.pollenParent.id}`} className="text-center">
            <div className="flex size-14 items-center justify-center rounded-xl bg-blue-500/10 mx-auto">
              <Leaf className="size-6 text-blue-500" />
            </div>
            <p className="mt-2 font-medium text-sm">{result.pollenParent.name}</p>
            <p className="text-xs text-muted-foreground">Pollen Parent (♂)</p>
          </Link>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Trait Comparison</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {c.traitKeys.map((key: string) => {
                const seedVal = c.seedTraits[key] ?? "—"
                const pollenVal = c.pollenTraits[key] ?? "—"
                const match = seedVal === pollenVal
                return (
                  <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
                    {match ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> : <XCircle className="size-4 text-muted-foreground/40 shrink-0" />}
                    <p className="text-xs font-medium w-28 shrink-0 text-muted-foreground">{key}</p>
                    <p className="text-sm flex-1 text-right">{seedVal}</p>
                    <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    <p className="text-sm flex-1">{pollenVal}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-sm">Parent Experience</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">{result.seedParent.name}:</span> {result.parentExperience.seedTotal} crosses</p>
              <p className="text-sm"><span className="text-muted-foreground">{result.pollenParent.name}:</span> {result.parentExperience.pollenTotal} crosses</p>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-sm">Previous Crosses</CardTitle></CardHeader>
            <CardContent>
              {result.previousCrosses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No previous crosses between these parents</p>
              ) : (
                <div className="space-y-1">
                  {result.previousCrosses.map((c: any) => (
                    <Link key={c.id} href={`/crosses/${c.id}`} className="flex items-center gap-2 text-sm hover:text-primary">
                      <GitMerge className="size-3" />
                      <span>{c.crossNumber ?? "Cross"}</span>
                      <Badge variant="outline" className="text-[10px]">{c.seedlings?.length ?? 0} seedlings</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Link href={`/crosses/new?seedParentId=${result.seedParent.id}&pollenParentId=${result.pollenParent.id}`}>
            <Button><GitMerge className="mr-2 size-4" />Create Cross from These Parents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cross Planner</h1>
        <p className="text-sm text-muted-foreground">Compare two parent plants and see their trait compatibility</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Select Parents</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Seed Parent (♀)</p>
            <Select value={seedId} onValueChange={(v) => setSeedId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choose seed parent..." /></SelectTrigger>
              <SelectContent>
                {plants.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name}{p.species ? ` (${p.species.name})` : ""}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Pollen Parent (♂)</p>
            <Select value={pollenId} onValueChange={(v) => setPollenId(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="Choose pollen parent..." /></SelectTrigger>
              <SelectContent>
                {plants.filter((p: any) => p.id !== seedId).map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name}{p.species ? ` (${p.species.name})` : ""}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCompare} disabled={!seedId || !pollenId || loading} className="w-full">
            {loading ? "Comparing..." : "Compare Parents"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
