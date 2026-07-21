import { prisma } from "@/lib/prisma"
import { QuickEvalClient } from "./client"
import { requireUserId } from "@/lib/require-user"

export const dynamic = "force-dynamic"

export default async function QuickEvalPage(props: { searchParams: Promise<{ speciesId?: string }> }) {
  const userId = await requireUserId()
  const { speciesId } = await props.searchParams

  const seedlings = await prisma.seedling.findMany({
    where: {
      createdById: userId,
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

  const species = await prisma.species.findMany({ orderBy: { name: "asc" }, include: { traits: { orderBy: { sortOrder: "asc" } } } })

  return <QuickEvalClient seedlings={seedlings} species={species} />
}
