"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Sprout, ArrowRight } from "lucide-react"
import Link from "next/link"

const STEPS = [
  { title: "Parent Plants", description: "Start with established plants that have known traits and pedigree information." },
  { title: "Cross Creation", description: "Plan crosses between parent plants to create new genetic combinations." },
  { title: "Seed Batches", description: "Track seed harvests, storage conditions, and stratification requirements." },
  { title: "Seedling Evaluation", description: "Score seedlings on key traits and track their development over time." },
  { title: "Final Selection", description: "Select the best performers as future breeding parents or new varieties." },
]

export function DemoTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem("hybridx-demo-tour")
    if (!seen) setOpen(true)
  }, [])

  function dismiss() {
    localStorage.setItem("hybridx-demo-tour", "true")
    setOpen(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
    else dismiss()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="size-5 text-primary" />
              <span className="font-semibold text-sm">HybridX Demo Tour</span>
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
          <div className="space-y-2 text-center py-4">
            <p className="text-3xl">{["🌱", "🔀", "🌰", "⭐", "🏆"][step]}</p>
            <h3 className="font-semibold text-lg">{STEPS[step].title}</h3>
            <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => <div key={i} className={`h-1.5 w-6 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />)}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={dismiss}>Skip tour</Button>
            <Button size="sm" onClick={next}>{step < STEPS.length - 1 ? <>Next <ArrowRight className="ml-1 size-3" /></> : "Got it!"}</Button>
          </div>
          {step === STEPS.length - 1 && (
            <Link href="/signup" className="block text-center text-sm text-primary hover:underline">Create your free account →</Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
