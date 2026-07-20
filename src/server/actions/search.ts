"use server"

import { prisma } from "@/lib/prisma"

export async function globalSearch(query: string) {
  if (!query.trim()) return { plants: [], crosses: [], seedlings: [], seeds: [], species: [] }

  const [plants, crosses, seedlings, seeds, species] = await Promise.all([
    prisma.plant.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { varietyName: { contains: query, mode: "insensitive" } },
          { colour: { contains: query, mode: "insensitive" } },
          { fragrance: { contains: query, mode: "insensitive" } },
          { origin: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, species: { select: { name: true } }, year: true, colour: true },
      take: 10,
    }),
    prisma.cross.findMany({
      where: {
        OR: [
          { crossNumber: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
          { seedParent: { name: { contains: query, mode: "insensitive" } } },
          { pollenParent: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      select: { id: true, crossNumber: true, seedParent: { select: { name: true } }, pollenParent: { select: { name: true } }, method: true },
      take: 10,
    }),
    prisma.seedling.findMany({
      where: {
        OR: [
          { seedlingId: { contains: query, mode: "insensitive" } },
          { colour: { contains: query, mode: "insensitive" } },
          { fragrance: { contains: query, mode: "insensitive" } },
          { growthNotes: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, seedlingId: true, year: true, colour: true, disposition: true },
      take: 10,
    }),
    prisma.seed.findMany({
      where: {
        OR: [
          { batchNumber: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, batchNumber: true, stage: true, totalCount: true },
      take: 10,
    }),
    prisma.species.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, slug: true },
      take: 10,
    }),
  ])

  return { plants, crosses, seedlings, seeds, species }
}
