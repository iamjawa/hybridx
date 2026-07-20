"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEvaluation } from "@/server/actions/seedlings"
import { Sprout, ChevronLeft, ChevronRight, Keyboard, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const SCORE_FIELDS = [
  { key: "vigour", label: "Vigour", max: 10 },
  { key: "flowerForm", label: "Flower Form", max: 10 },
  { key: "fragrance", label: "Fragrance", max: 10 },
  { key: "diseaseResistance", label: "Disease Resistance", max: 10 },
  { key: "novelty", label: "Novelty", max: 10 },
]

export function QuickEvalClient({ seedlings: initialSeedlings, species }: any) {
  const router = useRouter()
  const [seedlings] = useState(initialSeedlings)
  const [index, setIndex] = useState(0)
  const [speciesFilter, setSpeciesFilter] = useState("")
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [activeField, setActiveField] = useState(0)
  const inputRefs = useRef<(HTMLButtonElement | null)[]>([])

  const filtered = seedlings.filter((s: any) => !speciesFilter || s.speciesId === speciesFilter)
  const current = filtered[index] as any
  const currentScores = scores[current?.id] ?? {}

  const evaluatedCount = saved.size
  const totalCount = filtered.length

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!current) return

      if (e.key === "ArrowRight" || e.key === "n") {
        e.preventDefault()
        goNext()
        return
      }
      if (e.key === "ArrowLeft" || e.key === "p") {
        e.preventDefault()
        goPrev()
        return
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSave()
        return
      }

      if (e.key === "Tab") {
        e.preventDefault()
        const next = (activeField + 1) % (SCORE_FIELDS.length + 1)
        setActiveField(next)
        if (next < SCORE_FIELDS.length) {
          inputRefs.current[next]?.focus()
        }
        return
      }

      const field = SCORE_FIELDS[activeField]
      if (field && e.key >= "0" && e.key <= "9") {
        const val = parseInt(e.key)
        if (val <= field.max) {
          setScores((prev) => ({
            ...prev,
            [current.id]: { ...prev[current.id], [field.key]: val },
          }))
          const next = (activeField + 1) % SCORE_FIELDS.length
          setActiveField(next)
          inputRefs.current[next]?.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [current, activeField, scores])

  useEffect(() => {
    inputRefs.current[activeField]?.focus()
  }, [activeField, index])

  function setScore(field: string, value: number) {
    if (!current) return
    setScores((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], [field]: value },
    }))
  }

  async function handleSave() {
    if (!current || saving) return
    const data = currentScores
    if (Object.keys(data).length === 0) { toast.error("Enter at least one score"); return }
    setSaving(true)
    const result = await createEvaluation({
      seedlingId: current.id,
      systemName: "Quick Eval",
      criteria: {},
      scores: data,
      totalScore: Object.values(data).reduce((a: number, b: number) => a + b, 0) / Object.keys(data).length,
    })
    setSaving(false)
    if (!result.success) { toast.error(result.error); return }
    setSaved(new Set(saved).add(current.id))
    toast.success(`Saved — ${current.seedlingId}`)
    if (index < filtered.length - 1) {
      setIndex(index + 1)
      setActiveField(0)
    }
    router.refresh()
  }

  function goNext() {
    if (index < filtered.length - 1) {
      setIndex(index + 1)
      setActiveField(0)
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex(index - 1)
      setActiveField(0)
    }
  }

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card><CardContent className="py-12 text-center">
          <CheckCircle2 className="mx-auto size-12 text-emerald-500/60" />
          <p className="mt-4 text-lg font-medium">All evaluated!</p>
          <p className="text-sm text-muted-foreground mt-1">No more seedlings to evaluate</p>
          <Button className="mt-6" onClick={() => router.push("/evaluation")}>Back to Evaluation</Button>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Quick Evaluation</h1>
          <p className="text-sm text-muted-foreground">Keyboard-driven scoring — type numbers, Tab to move, Enter to save</p>
        </div>
        <div className="flex items-center gap-2">
          <Keyboard className="size-4 text-muted-foreground" />
          <Select value={speciesFilter} onValueChange={(v) => setSpeciesFilter(v ?? "")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All species</SelectItem>
              {species.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Progress value={(evaluatedCount / Math.max(totalCount, 1)) * 100} className="h-1.5" />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{evaluatedCount} evaluated · {totalCount} total</span>
        <span>#{index + 1} of {totalCount}</span>
      </div>

      {current && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Sprout className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{current.seedlingId}</h2>
                  <p className="text-sm text-muted-foreground">
                    {current.cross?.seedParent?.name ?? "?"} × {current.cross?.pollenParent?.name ?? "?"}
                    {current.species ? ` · ${current.species.name}` : ""}
                  </p>
                </div>
              </div>
              {saved.has(current.id) && <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500" variant="outline"><CheckCircle2 className="size-3 mr-1" />Saved</Badge>}
            </div>

            <div className="space-y-3">
              {SCORE_FIELDS.map((field, i) => (
                <div key={field.key} className="flex items-center gap-4">
                  <label className="text-sm font-medium w-32 shrink-0">{field.label}</label>
                  <div className="flex-1 flex gap-1">
                    {Array.from({ length: field.max }, (_, v) => v + 1).map((val) => {
                      const isActive = currentScores[field.key] === val
                      return (
                        <button
                          key={val}
                          ref={(el) => { inputRefs.current[i] = el }}
                          onClick={() => setScore(field.key, val)}
                          className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          } ${activeField === i ? "ring-2 ring-primary/50" : ""}`}
                          tabIndex={-1}
                        >
                          {val}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goPrev} disabled={index === 0}>
                  <ChevronLeft className="size-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" onClick={goNext} disabled={index >= filtered.length - 1}>
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
              <Button onClick={handleSave} disabled={saving || Object.keys(currentScores).length === 0} size="lg" className="px-8">
                {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                Save & Next
              </Button>
            </div>

            <div className="text-xs text-muted-foreground/60 text-center space-y-1">
              <p>Type <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">0-9</kbd> to score · <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Tab</kbd> to move · <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to save</p>
              <p><kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">←</kbd> <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">→</kbd> or <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">n</kbd> <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">p</kbd> to navigate</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
