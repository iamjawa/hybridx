"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getCrosses(params?: {
  speciesId?: string
  seedParentId?: string
  pollenParentId?: string
  page?: number
  limit?: number
}) {
  const { speciesId, seedParentId, pollenParentId, page = 1, limit = 20 } = params || {}
  const where: any = {}
  if (speciesId) where.speciesId = speciesId
  if (seedParentId) where.seedParentId = seedParentId
  if (pollenParentId) where.pollenParentId = pollenParentId
  const [crosses, total] = await Promise.all([
    prisma.cross.findMany({
      where,
      include: {
        seedParent: true,
        pollenParent: true,
        species: true,
        seedlings: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cross.count({ where }),
  ])
  return { crosses, total, pages: Math.ceil(total / limit) }
}

export async function getCrossById(id: string) {
  return prisma.cross.findUnique({
    where: { id },
    include: {
      seedParent: { include: { species: true } },
      pollenParent: { include: { species: true } },
      species: true,
      seedlings: { include: { images: { take: 1, where: { isPrimary: true } } }, orderBy: { seedlingId: "asc" } },
      pollinations: { include: { pollinatedBy: true }, orderBy: { pollinationDate: "desc" } },
    },
  })
}

export async function createCross(data: {
  speciesId?: string
  seedParentId?: string
  pollenParentId?: string
  crossNumber?: string
  plannedDate?: Date
  method?: string
  notes?: string
}): Promise<ActionResult> {
  try {
    await prisma.cross.create({
      data: {
        speciesId: data.speciesId,
        seedParentId: data.seedParentId,
        pollenParentId: data.pollenParentId,
        crossNumber: data.crossNumber,
        plannedDate: data.plannedDate,
        method: data.method as any ?? "MANUAL",
        notes: data.notes,
      },
    })
    revalidatePath("/crosses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create cross" }
  }
}

export async function updateCross(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    await prisma.cross.update({ where: { id }, data })
    revalidatePath("/crosses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update cross" }
  }
}

export async function recordPollination(data: {
  crossId: string
  pollinationDate: Date
  method: string
  tagNumber?: string
  flowerNumber?: number
  isolation?: string
  weather?: string
  notes?: string
}): Promise<ActionResult> {
  try {
    await prisma.pollination.create({
      data: {
        crossId: data.crossId,
        pollinationDate: data.pollinationDate,
        method: data.method,
        tagNumber: data.tagNumber,
        flowerNumber: data.flowerNumber,
        isolation: data.isolation,
        weather: data.weather,
        notes: data.notes,
      },
    })
    await prisma.cross.update({
      where: { id: data.crossId },
      data: { pollinationDate: data.pollinationDate },
    })
    revalidatePath("/crosses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to record pollination" }
  }
}
