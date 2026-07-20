import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LabelPage(props: { searchParams: Promise<{ type?: string; id?: string }> }) {
  const { type, id } = await props.searchParams
  if (!type || !id) notFound()

  let entity: any = null
  let title = ""
  let subtitle = ""
  let url = ""

  if (type === "plant") {
    entity = await prisma.plant.findUnique({ where: { id }, include: { species: true } })
    if (!entity) notFound()
    title = entity.name
    subtitle = entity.species?.name ?? ""
    url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hybridx-production.up.railway.app"}/scan/plant/${entity.id}`
  } else if (type === "seedling") {
    entity = await prisma.seedling.findUnique({ where: { id }, include: { cross: { include: { seedParent: true, pollenParent: true } } } })
    if (!entity) notFound()
    title = entity.seedlingId
    subtitle = entity.cross ? `${entity.cross.seedParent?.name ?? "?"} × ${entity.cross.pollenParent?.name ?? "?"}` : ""
    url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hybridx-production.up.railway.app"}/scan/seedling/${entity.id}`
  } else if (type === "seed") {
    entity = await prisma.seed.findUnique({ where: { id } })
    if (!entity) notFound()
    title = entity.batchNumber ?? "Seed Batch"
    subtitle = `${entity.totalCount} seeds · ${entity.stage}`
    url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hybridx-production.up.railway.app"}/scan/seed/${entity.id}`
  } else {
    notFound()
  }

  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(url)}`

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-white" id="label">
      <div className="w-[400px] rounded-2xl border-2 p-8 space-y-4 text-center font-sans">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400">HybridX</p>
          <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <div className="flex justify-center">
          <img src={qrUrl} alt="QR Code" className="size-48" />
        </div>
        <p className="text-[10px] text-neutral-400">Scan to view • HybridX Breeding Platform</p>
      </div>
    </div>
  )
}
