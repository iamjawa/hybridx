import { prisma } from "@/lib/prisma"
import { QuickEvalClient } from "./client"

export const dynamic = "force-dynamic"

export default async function QuickEvalPage(props: { searchParams: Promise<{ speciesId?: string }> }) {
  const { speciesId } = await props.searchParams

  const seedlings = await prisma.seedling.findMany({
    where: {
      disposition: { not: "CULLED" },
      ...(speciesId ? { speciesId } : {}),
    },
    include: {
      cross: { include: { seedParent: true, pollenParent: true } },
      species: true,
      evaluations: { take: 1, orderBy: { date: "desc" } },
    },
    orderBy: { seedlingId: "asc" },
    take: 200,
  })

  const species = await prisma.species.findMany({ orderBy: { name: "asc" } })

  return <QuickEvalClient seedlings={seedlings} species={species} />
}
