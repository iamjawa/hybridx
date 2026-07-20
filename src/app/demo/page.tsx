import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Sprout, Leaf, GitMerge, Star, Target, Flower2, Database } from "lucide-react"
import { DemoTour } from "@/components/demo-tour"

export const dynamic = "force-dynamic"

export default async function DemoPage() {
  const [plantCount, crossCount, seedlingCount, seedCount, speciesCount, evaluationCount, goalCount, potentialKeepers, plants, crosses, seedlings, goals] = await Promise.all([
    prisma.plant.count({ where: { deletedAt: null } }),
    prisma.cross.count({ where: { deletedAt: null } }),
    prisma.seedling.count({ where: { deletedAt: null } }),
    prisma.seed.count({ where: { deletedAt: null } }),
    prisma.species.count(),
    prisma.evaluation.count(),
    prisma.breedingGoal.count(),
    prisma.seedling.count({ where: { disposition: "SELECTED" } }),
    prisma.plant.findMany({ orderBy: { name: "asc" }, include: { species: true }, take: 6 }),
    prisma.cross.findMany({ orderBy: { createdAt: "desc" }, include: { seedParent: true, pollenParent: true }, take: 6 }),
    prisma.seedling.findMany({ orderBy: { seedlingId: "asc" }, where: { disposition: "SELECTED" }, include: { cross: { include: { seedParent: true, pollenParent: true } } }, take: 6 }),
    prisma.breedingGoal.findMany({ take: 3 }),
  ])

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-5" />
            </div>
            <span className="font-semibold">HybridX Demo</span>
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Rose Breeding Programme</span>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link href="/onboarding" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Try HybridX</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <DemoTour />
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <Sprout className="size-3.5" />
            Demo Data — Rose Breeding Programme
          </div>
          <h1 className="text-3xl font-bold tracking-tight">A complete breeding programme</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore a realistic rose breeding dataset showcasing plants, crosses, seedlings, evaluations, and breeding goals.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DemoStat icon={Leaf} label="Plants" value={plantCount} />
          <DemoStat icon={GitMerge} label="Crosses" value={crossCount} />
          <DemoStat icon={Database} label="Seed Batches" value={seedCount} />
          <DemoStat icon={Sprout} label="Seedlings" value={seedlingCount} />
          <DemoStat icon={Star} label="Evaluations" value={evaluationCount} />
          <DemoStat icon={Target} label="Goals" value={goalCount} />
          <DemoStat icon={Flower2} label="Species" value={speciesCount} />
          <DemoStat icon={Leaf} label="Breeder Lines" value={potentialKeepers} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Featured Plants</h2>
            {plants.map((p) => (
              <DemoCard key={p.id} icon={Leaf} label={p.name} sub={`${p.species?.name ?? ""}${p.year ? ` · ${p.year}` : ""}${p.colour ? ` · ${p.colour}` : ""}`} />
            ))}
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Crosses</h2>
            {crosses.map((c) => (
              <DemoCard key={c.id} icon={GitMerge} label={`${c.seedParent?.name ?? "?"} × ${c.pollenParent?.name ?? "?"}`} sub={c.crossNumber ?? ""} />
            ))}
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Selected Seedlings</h2>
            {seedlings.map((s) => (
              <DemoCard key={s.id} icon={Sprout} label={s.seedlingId} sub={s.cross ? `${s.cross.seedParent?.name ?? "?"} × ${s.cross.pollenParent?.name ?? "?"}` : ""} />
            ))}
          </div>
        </div>

        <div className="text-center border-t pt-8">
          <p className="text-sm text-muted-foreground mb-4">Want to manage your own breeding programme?</p>
          <Link href="/onboarding" className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Start Your Programme
          </Link>
        </div>
      </main>
    </div>
  )
}

function DemoStat({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <Icon className="size-5 mx-auto text-primary" />
      <p className="text-2xl font-semibold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function DemoCard({ icon: Icon, label, sub }: { icon: any; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <Icon className="size-5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  )
}
