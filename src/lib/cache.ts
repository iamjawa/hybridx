import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getCachedSpecies = unstable_cache(
  async () => {
    return prisma.species.findMany({
      orderBy: { name: "asc" },
      include: { traits: { orderBy: { sortOrder: "asc" } } },
    })
  },
  ["species"],
  { revalidate: 3600, tags: ["species"] }
)

export const getCachedSpeciesList = unstable_cache(
  async () => {
    return prisma.species.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    })
  },
  ["species-list"],
  { revalidate: 3600, tags: ["species"] }
)

export const getCachedNavCounts = unstable_cache(
  async () => {
    const [plantCount, crossCount, seedlingCount, seedCount, speciesCount, goalCount] = await Promise.all([
      prisma.plant.count({ where: { deletedAt: null } }),
      prisma.cross.count({ where: { deletedAt: null } }),
      prisma.seedling.count({ where: { deletedAt: null } }),
      prisma.seed.count({ where: { deletedAt: null } }),
      prisma.species.count(),
      prisma.breedingGoal.count(),
    ])
    return { plantCount, crossCount, seedlingCount, seedCount, speciesCount, goalCount }
  },
  ["nav-counts"],
  { revalidate: 300, tags: ["nav-counts"] }
)
