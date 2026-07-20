"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getSeedlings(params?: {
  speciesId?: string
  crossId?: string
  year?: number
  disposition?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { speciesId, crossId, year, disposition, search, page = 1, limit = 20 } = params || {}
  const where: any = {}
  if (speciesId) where.speciesId = speciesId
  if (crossId) where.crossId = crossId
  if (year) where.year = year
  if (disposition) where.disposition = disposition
  if (search) where.seedlingId = { contains: search, mode: "insensitive" }
  const [seedlings, total] = await Promise.all([
    prisma.seedling.findMany({
      where,
      include: {
        cross: { include: { seedParent: true, pollenParent: true } },
        species: true,
        images: { where: { isPrimary: true }, take: 1 },
        evaluations: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { seedlingId: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.seedling.count({ where }),
  ])
  return { seedlings, total, pages: Math.ceil(total / limit) }
}

export async function getSeedlingById(id: string) {
  return prisma.seedling.findUnique({
    where: { id },
    include: {
      cross: { include: { seedParent: true, pollenParent: true } },
      species: true,
      images: true,
      traitValues: { include: { trait: true } },
      evaluations: { include: { evaluator: true }, orderBy: { date: "desc" } },
      location: true,
    },
  })
}

export async function createSeedling(data: {
  seedlingId: string
  year: number
  crossId?: string
  speciesId?: string
  generation?: string
  seedParentId?: string
  crossParentId?: string
  notes?: string
}): Promise<ActionResult> {
  try {
    await prisma.seedling.create({ data: data as any })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create seedling" }
  }
}

export async function updateSeedling(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    await prisma.seedling.update({ where: { id }, data })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update seedling" }
  }
}

export async function createEvaluation(data: {
  seedlingId: string
  systemName: string
  criteria: Record<string, any>
  scores: Record<string, any>
  totalScore?: number
  notes?: string
}): Promise<ActionResult> {
  try {
    await prisma.evaluation.create({ data: data as any })
    revalidatePath("/evaluation")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create evaluation" }
  }
}

export async function setDisposition(
  seedlingId: string,
  disposition: string
): Promise<ActionResult> {
  try {
    await prisma.seedling.update({
      where: { id: seedlingId },
      data: { disposition: disposition as any },
    })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to set disposition" }
  }
}

export async function toggleFavourite(seedlingId: string): Promise<ActionResult> {
  try {
    const seedling = await prisma.seedling.findUnique({ where: { id: seedlingId }, select: { isFavourite: true } })
    if (!seedling) return { success: false, error: "Seedling not found" }
    await prisma.seedling.update({
      where: { id: seedlingId },
      data: { isFavourite: !seedling.isFavourite },
    })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to toggle favourite" }
  }
}
