import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Sprout, Leaf, Star } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ScanPlantPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const plant = await prisma.plant.findUnique({ where: { id }, include: { species: true, images: { where: { isPrimary: true }, take: 1 } } })
  if (!plant) notFound()

  return (
    <div className="min-h-dvh max-w-md mx-auto p-4 space-y-4">
      {plant.images?.[0] ? (
        <img src={plant.images[0].url} alt={plant.name} className="w-full aspect-video rounded-2xl object-cover" />
      ) : (
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-primary/5 to-muted flex items-center justify-center">
          <Leaf className="size-12 text-muted-foreground/20" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{plant.name}</h1>
        <p className="text-muted-foreground">{plant.species?.name ?? ""}{plant.year ? ` · ${plant.year}` : ""}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {plant.colour && <Info label="Colour" value={plant.colour} />}
        {plant.fragrance && <Info label="Fragrance" value={plant.fragrance} />}
        {plant.status && <Info label="Status" value={plant.status} />}
      </div>
      <div className="flex gap-2">
        <Link href={`/plants/${id}`} className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium">View Details</Link>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium mt-0.5">{value}</p></div>
}
