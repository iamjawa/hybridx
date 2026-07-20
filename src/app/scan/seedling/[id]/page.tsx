import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Sprout, Star, Heart } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ScanSeedlingPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const seedling = await prisma.seedling.findUnique({
    where: { id },
    include: { cross: { include: { seedParent: true, pollenParent: true } }, evaluations: { take: 1, orderBy: { date: "desc" } } },
  })
  if (!seedling) notFound()

  return (
    <div className="min-h-dvh max-w-md mx-auto p-4 space-y-4">
      <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-emerald-500/5 to-muted flex items-center justify-center">
        <Sprout className="size-12 text-muted-foreground/20" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{seedling.seedlingId}</h1>
        <p className="text-muted-foreground">
          {seedling.cross?.seedParent?.name ?? "?"} × {seedling.cross?.pollenParent?.name ?? "?"}
          {seedling.generation ? ` · ${seedling.generation}` : ""}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {seedling.colour && <Info label="Colour" value={seedling.colour} />}
        {seedling.health != null && <Info label="Health" value={`${seedling.health}/10`} />}
        {seedling.disposition && <Info label="Status" value={seedling.disposition} />}
        {seedling.evaluations?.[0]?.totalScore != null && <Info label="Score" value={`${seedling.evaluations[0].totalScore}/10`} />}
      </div>
      <div className="flex gap-2">
        <Link href={`/seedlings/${id}`} className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium">View Details</Link>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium mt-0.5">{value}</p></div>
}
