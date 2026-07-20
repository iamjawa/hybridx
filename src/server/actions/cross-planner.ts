"use server"

import { prisma } from "@/lib/prisma"

export async function getCrossPlannerData(seedParentId: string, pollenParentId: string) {
  const [seedParent, pollenParent, userCrosses] = await Promise.all([
    prisma.plant.findUnique({
      where: { id: seedParentId },
      include: {
        species: true,
        traitValues: { include: { trait: true } },
        crossesAsSeedParent: { include: { pollenParent: true, seedlings: { select: { id: true } } } },
        crossesAsPollenParent: { include: { seedParent: true, seedlings: { select: { id: true } } } },
      },
    }),
    prisma.plant.findUnique({
      where: { id: pollenParentId },
      include: {
        species: true,
        traitValues: { include: { trait: true } },
        crossesAsSeedParent: { include: { pollenParent: true, seedlings: { select: { id: true } } } },
        crossesAsPollenParent: { include: { seedParent: true, seedlings: { select: { id: true } } } },
      },
    }),
    prisma.cross.findMany({
      where: {
        OR: [
          { seedParentId, pollenParentId },
          { seedParentId: pollenParentId, pollenParentId: seedParentId },
        ],
      },
      include: {
        seedlings: { select: { id: true, disposition: true } },
        species: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { seedParent, pollenParent, previousCrosses: userCrosses }
}

function getTraitMap(plant: any): Record<string, any> {
  if (!plant) return {}
  const traits: Record<string, any> = {}
  if (plant.colour) traits["Colour"] = plant.colour
  if (plant.fragrance) traits["Fragrance"] = plant.fragrance
  if (plant.diseaseResistance) traits["Disease Resistance"] = plant.diseaseResistance
  if (plant.repeatFlowering != null) traits["Repeat Flowering"] = plant.repeatFlowering ? "Yes" : "No"
  if (plant.pollenFertility != null) traits["Pollen Fertility"] = `${plant.pollenFertility}%`
  if (plant.seedFertility != null) traits["Seed Fertility"] = `${plant.seedFertility}%`
  if (plant.height != null) traits["Height"] = `${plant.height}cm`
  plant.traitValues?.forEach((tv: any) => {
    traits[tv.trait?.name ?? "Trait"] = String(tv.value)
  })
  return traits
}

export async function compareParents(seedParentId: string, pollenParentId: string) {
  const data = await getCrossPlannerData(seedParentId, pollenParentId)
  if (!data.seedParent || !data.pollenParent) return null

  const seedTraits = getTraitMap(data.seedParent)
  const pollenTraits = getTraitMap(data.pollenParent)
  const allKeys = Array.from(new Set([...Object.keys(seedTraits), ...Object.keys(pollenTraits)]))

  const matchedTraits = allKeys.filter((k) => seedTraits[k] === pollenTraits[k]).length
  const compatibility = allKeys.length > 0
    ? Math.round((matchedTraits / allKeys.length) * 100)
    : 50

  const seedTotal = (data.seedParent.crossesAsSeedParent?.length ?? 0) + (data.seedParent.crossesAsPollenParent?.length ?? 0)
  const pollenTotal = (data.pollenParent.crossesAsSeedParent?.length ?? 0) + (data.pollenParent.crossesAsPollenParent?.length ?? 0)

  return {
    seedParent: data.seedParent,
    pollenParent: data.pollenParent,
    comparison: {
      traitKeys: allKeys,
      seedTraits,
      pollenTraits,
      overlap: matchedTraits,
      totalTraits: allKeys.length,
      compatibilityScore: compatibility,
    },
    previousCrosses: data.previousCrosses,
    parentExperience: {
      seedTotal,
      pollenTotal,
    },
  }
}
