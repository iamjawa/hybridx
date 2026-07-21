"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"
import { auditLog } from "@/lib/audit"
import { requireUserId } from "@/lib/require-user"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { CreateSeedlingSchema, UpdateSeedlingSchema, CreateEvaluationSchema } from "@/lib/validations"
import { z } from "zod/v4"

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
  const userId = await requireUserId()
  const where: any = { deletedAt: null, createdById: userId }
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
  const userId = await requireUserId()
  return prisma.seedling.findFirst({
    where: { id, createdById: userId },
    include: {
      cross: { include: { seedParent: true, pollenParent: true } },
      species: true,
      images: true,
      traitValues: { include: { trait: true } },
      evaluations: { include: { evaluator: true }, orderBy: { date: "desc" } },
      location: true,
      goalScores: { include: { goal: true }, orderBy: { overallScore: "desc" } },
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
    const userId = await requireUserId()
    const parsed = CreateSeedlingSchema.parse(data)
    const seedling = await prisma.seedling.create({ data: { ...parsed, createdById: userId } as any })
    auditLog({ action: "create", entity: "Seedling", entityId: seedling.id })
    trackEvent(EVENTS.SEEDLING_CREATED, { seedlingId: parsed.seedlingId })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to create seedling" }
  }
}

export async function updateSeedling(id: string, data: z.infer<typeof UpdateSeedlingSchema>): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.seedling.findFirst({ where: { id, createdById: userId } })
    if (!existing) return { success: false, error: "Seedling not found" }
    const parsed = UpdateSeedlingSchema.parse(data)
    await prisma.seedling.update({ where: { id }, data: parsed as any })
    auditLog({ action: "update", entity: "Seedling", entityId: id })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
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
    const userId = await requireUserId()
    const parsed = CreateEvaluationSchema.parse(data)
    await prisma.evaluation.create({ data: { ...parsed, evaluatorId: userId } as any })
    trackEvent(EVENTS.EVALUATION_COMPLETED, { seedlingId: parsed.seedlingId })
    revalidatePath("/evaluation")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to create evaluation" }
  }
}

export async function setDisposition(
  seedlingId: string,
  disposition: string
): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.seedling.findFirst({ where: { id: seedlingId, createdById: userId } })
    if (!existing) return { success: false, error: "Seedling not found" }
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
    const userId = await requireUserId()
    await prisma.$transaction(async (tx) => {
      const seedling = await tx.seedling.findFirst({ where: { id: seedlingId, createdById: userId }, select: { isFavourite: true } })
      if (!seedling) throw new Error("Seedling not found")
      await tx.seedling.update({
        where: { id: seedlingId },
        data: { isFavourite: !seedling.isFavourite },
      })
    })
    revalidatePath("/seedlings")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to toggle favourite" }
  }
}
