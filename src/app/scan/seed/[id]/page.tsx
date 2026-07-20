import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Database } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ScanSeedPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const seed = await prisma.seed.findUnique({ where: { id }, include: { cross: { include: { seedParent: true, pollenParent: true } } } })
  if (!seed) notFound()

  return (
    <div className="min-h-dvh max-w-md mx-auto p-4 space-y-4">
      <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-amber-500/5 to-muted flex items-center justify-center">
        <Database className="size-12 text-muted-foreground/20" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{seed.batchNumber ?? "Seed Batch"}</h1>
        <p className="text-muted-foreground">{seed.totalCount} seeds{seed.cross ? ` · ${seed.cross.seedParent?.name ?? "?"} × ${seed.cross.pollenParent?.name ?? "?"}` : ""}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Stage" value={seed.stage} />
        <Info label="Viable" value={seed.viableCount != null ? String(seed.viableCount) : "—"} />
        <Info label="Germinated" value={seed.germinatedCount != null ? String(seed.germinatedCount) : "—"} />
        <Info label="Rate" value={seed.successRate != null ? `${seed.successRate}%` : "—"} />
      </div>
      <div className="flex gap-2">
        <Link href={`/seeds/${id}`} className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium">View Details</Link>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium mt-0.5">{value}</p></div>
}
