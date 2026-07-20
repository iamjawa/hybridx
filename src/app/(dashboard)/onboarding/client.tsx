"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { Sprout, Leaf, GitMerge, Target, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import { createSpecies } from "@/server/actions/species"
import { createPlant } from "@/server/actions/plants"
import { createCross } from "@/server/actions/crosses"
import { createGoal } from "@/server/actions/goals"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { trackEvent } from "@/server/actions/track"

const STEPS = ["Species", "First Plant", "First Cross", "Breeding Goal", "Ready"]

const SUGGESTED_SPECIES = [
  { name: "Rose", slug: "rose", emoji: "🌹", description: "Rosa — the classic garden rose" },
  { name: "Orchid", slug: "orchid", emoji: "🌺", description: "Orchidaceae — exotic blooms" },
  { name: "Dahlia", slug: "dahlia", emoji: "🌸", description: "Dahlia — spectacular variety" },
  { name: "Tomato", slug: "tomato", emoji: "🍅", description: "Solanum lycopersicum — breeding for flavour" },
]

export function OnboardingClient({ species: existingSpecies }: any) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [selectedSpecies, setSelectedSpecies] = useState("")
  const [newSpeciesName, setNewSpeciesName] = useState("")

  const [plantName, setPlantName] = useState("")
  const [plantSpecies, setPlantSpecies] = useState("")

  const [crossSeed, setCrossSeed] = useState("")
  const [crossPollen, setCrossPollen] = useState("")

  const [goalName, setGoalName] = useState("")
  const [goalColour, setGoalColour] = useState("50")
  const [goalFragrance, setGoalFragrance] = useState("30")
  const [goalHealth, setGoalHealth] = useState("20")

  const speciesList = existingSpecies.length > 0 ? existingSpecies : SUGGESTED_SPECIES
  const allSpeciesNames = speciesList.map((s: any) => s.name)

  async function handleStep1() {
    setLoading(true)
    const name = selectedSpecies || newSpeciesName
    if (!name.trim()) { toast.error("Select or enter a species"); setLoading(false); return }
    const slug = name.toLowerCase().replace(/\s+/g, "-")
    const existing = existingSpecies.find((s: any) => s.name.toLowerCase() === name.toLowerCase())
    if (!existing) {
      await createSpecies({ name, slug })
    }
    setPlantSpecies(name)
    setLoading(false)
    setStep(1)
  }

  async function handleStep2() {
    if (!plantName.trim()) { toast.error("Enter a name for your first plant"); return }
    setLoading(true)
    const species = speciesList.find((s: any) => s.name === plantSpecies)
    await createPlant({ name: plantName, speciesId: species?.id, origin: "My collection" })
    setLoading(false)
    setStep(2)
  }

  async function handleStep3() {
    setLoading(true)
    const cross = await createCross({
      seedParentId: crossSeed || undefined,
      pollenParentId: crossPollen || undefined,
      notes: "My first cross",
    })
    if (!cross.success) { toast.error(cross.error); setLoading(false); return }
    setLoading(false)
    setStep(3)
  }

  async function handleStep4() {
    if (!goalName.trim()) { toast.error("Give your goal a name"); return }
    setLoading(true)
    await createGoal({
      name: goalName,
      description: "My first breeding goal",
      criteria: [
        { traitName: "Colour", targetValue: goalColour, weight: parseInt(goalColour) || 34, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Fragrance", targetValue: goalFragrance, weight: parseInt(goalFragrance) || 33, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Health", targetValue: goalHealth, weight: parseInt(goalHealth) || 33, type: "SCALE_1_10", operator: "gte" },
      ],
    })
    setLoading(false)
    setStep(4)
  }

  function handleStartNew() {
    setStep(1)
  }

  async function handleFinish() {
    await trackEvent("ONBOARDING_COMPLETED", { plantName: plantName || "", goalName: goalName || "" })
    router.push("/dashboard")
    toast.success("Your breeding programme is ready!")
  }

  return (
    <div className="mx-auto max-w-lg py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sprout className="size-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to HybridX</h1>
        <p className="text-sm text-muted-foreground">Set up your breeding programme in a few minutes</p>
      </div>

      <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        {STEPS.map((s, i) => (
          <span key={s} className={`flex items-center gap-1 ${i <= step ? "text-foreground font-medium" : ""}`}>
            {i < step ? <CheckCircle2 className="size-3 text-emerald-500" /> : <span className="size-3 rounded-full border border-current" />}
            {s}
            {i < STEPS.length - 1 && <span className="text-muted-foreground/30 mx-1">—</span>}
          </span>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">How do you want to start?</p>
              <div className="space-y-3">
                <button onClick={() => handleStartNew()} className="w-full rounded-xl border p-4 text-left hover:border-muted-foreground/30 transition-colors flex items-center gap-4">
                  <span className="text-2xl">🌱</span>
                  <div><p className="font-medium">Start a new breeding programme</p><p className="text-xs text-muted-foreground">Set up your species, first plant, and breeding goal</p></div>
                </button>
                <Link href="/import" className="block w-full rounded-xl border p-4 text-left hover:border-muted-foreground/30 transition-colors flex items-center gap-4">
                  <span className="text-2xl">📂</span>
                  <div><p className="font-medium">Import my existing plants</p><p className="text-xs text-muted-foreground">Upload a CSV file with your plant collection</p></div>
                </Link>
                <Link href="/demo" className="block w-full rounded-xl border p-4 text-left hover:border-muted-foreground/30 transition-colors flex items-center gap-4">
                  <span className="text-2xl">🚀</span>
                  <div><p className="font-medium">Explore demo first</p><p className="text-xs text-muted-foreground">See a complete rose breeding programme</p></div>
                </Link>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => router.push("/dashboard")}>Skip to dashboard</Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Leaf className="size-5 text-primary" />
                <p className="text-sm font-medium">Name your first plant</p>
              </div>
              <div className="space-y-2">
                <Label>Plant name</Label>
                <Input value={plantName} onChange={(e) => setPlantName(e.target.value)} placeholder="e.g. My first rose" autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Species</Label>
                <p className="text-sm text-muted-foreground">{plantSpecies}</p>
              </div>
              <Button onClick={handleStep2} disabled={loading || !plantName.trim()} className="w-full">
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create Plant
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <GitMerge className="size-5 text-primary" />
                <p className="text-sm font-medium">Plan your first cross</p>
              </div>
              <p className="text-sm text-muted-foreground">Cross two plants to start your breeding programme. You can record specific parents later.</p>
              <div className="space-y-2">
                <Label>Seed Parent (optional)</Label>
                <Input value={crossSeed} onChange={(e) => setCrossSeed(e.target.value)} placeholder="Parent name" />
              </div>
              <div className="space-y-2">
                <Label>Pollen Parent (optional)</Label>
                <Input value={crossPollen} onChange={(e) => setCrossPollen(e.target.value)} placeholder="Parent name" />
              </div>
              <Button onClick={handleStep3} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create Cross
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="size-5 text-primary" />
                <p className="text-sm font-medium">Set a breeding goal</p>
              </div>
              <p className="text-sm text-muted-foreground">What are you breeding for? Set your priorities.</p>
              <div className="space-y-2">
                <Label>Goal name</Label>
                <Input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g. My ideal variety" autoFocus />
              </div>
              <p className="text-xs text-muted-foreground">Drag the sliders to set trait importance</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Colour</span><span>{goalColour}%</span></div>
                  <Slider value={[parseInt(goalColour)]} onValueChange={(v) => setGoalColour(String(Array.isArray(v) ? v[0] : v))} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Fragrance</span><span>{goalFragrance}%</span></div>
                  <Slider value={[parseInt(goalFragrance)]} onValueChange={(v) => setGoalFragrance(String(Array.isArray(v) ? v[0] : v))} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Health</span><span>{goalHealth}%</span></div>
                  <Slider value={[parseInt(goalHealth)]} onValueChange={(v) => setGoalHealth(String(Array.isArray(v) ? v[0] : v))} />
                </div>
              </div>
              <Button onClick={handleStep4} disabled={loading || !goalName.trim()} className="w-full">
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create Goal
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold">Your programme is ready</p>
                <p className="text-sm text-muted-foreground mt-1">You've created your first species, plant, cross, and breeding goal.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3"><p className="font-medium">{plantName || plantSpecies}</p><p className="text-xs text-muted-foreground">First Plant</p></div>
                <div className="rounded-lg border p-3"><p className="font-medium">{goalName || "Breeding Goal"}</p><p className="text-xs text-muted-foreground">First Goal</p></div>
              </div>
              <Button onClick={handleFinish} className="w-full">
                Go to Dashboard <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
