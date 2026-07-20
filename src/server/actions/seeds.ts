"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"
import { auditLog } from "@/lib/audit"
import { requireUserId } from "@/lib/require-user"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { CreateSeedSchema } from "@/lib/validations"
import { z } from "zod/v4"

export async function getSeeds(params?: {
  speciesId?: string
  crossId?: string
  stage?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { speciesId, crossId, stage, search, page = 1, limit = 20 } = params || {}
  const userId = await requireUserId()
  const where: any = { deletedAt: null, cross: { createdById: userId } }
  if (speciesId) where.speciesId = speciesId
  if (crossId) where.crossId = crossId
  if (stage) where.stage = stage.toUpperCase()
  if (search) {
    where.OR = [
      { batchNumber: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ]
  }
  const [seeds, total] = await Promise.all([
    prisma.seed.findMany({
      where,
      include: {
        cross: { include: { seedParent: true, pollenParent: true } },
        species: true,
        seedlings: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.seed.count({ where }),
  ])
  return { seeds, total, pages: Math.ceil(total / limit) }
}

export async function getSeedById(id: string) {
  return prisma.seed.findUnique({
    where: { id },
    include: {
      cross: { include: { seedParent: true, pollenParent: true, species: true } },
      species: true,
      seedlings: {
        include: { evaluations: { take: 1, orderBy: { date: "desc" } } },
        orderBy: { seedlingId: "asc" },
      },
    },
  })
}

export async function createSeed(data: {
  crossId?: string
  speciesId?: string
  batchNumber?: string
  harvestDate?: Date
  totalCount?: number
  viableCount?: number
  storageCondition?: string
  notes?: string
}): Promise<ActionResult> {
  try {
    await requireUserId()
    const parsed = CreateSeedSchema.parse(data)
    const seed = await prisma.seed.create({ data: parsed })
    auditLog({ action: "create", entity: "Seed", entityId: seed.id, metadata: { batchNumber: data.batchNumber } })
    trackEvent(EVENTS.SEED_BATCH_CREATED, { batchNumber: data.batchNumber })
    revalidatePath("/seeds")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to create seed batch" }
  }
}

export async function updateSeed(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    await prisma.seed.update({ where: { id }, data })
    auditLog({ action: "update", entity: "Seed", entityId: id })
    revalidatePath("/seeds")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update seed batch" }
  }
}

export async function startStratification(id: string, data: {
  stage: string
  coldStratDays?: number
  warmStratDays?: number
  stratificationStart?: Date
  notes?: string
}): Promise<ActionResult> {
  try {
    await prisma.seed.update({
      where: { id },
      data: {
        stage: data.stage as any,
        coldStratDays: data.coldStratDays,
        warmStratDays: data.warmStratDays,
        stratificationStart: data.stratificationStart ?? new Date(),
        notes: data.notes,
      },
    })
    revalidatePath("/seeds")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to start stratification" }
  }
}

export async function recordGermination(id: string, data: {
  germinatedCount?: number
  failedCount?: number
  germinationDate?: Date
  stage?: string
}): Promise<ActionResult> {
  try {
    const update: any = {
      germinatedCount: data.germinatedCount,
      failedCount: data.failedCount,
      germinationDate: data.germinationDate ?? new Date(),
      stage: (data.stage ?? "GERMINATED") as any,
    }
    if (data.germinatedCount != null && data.failedCount != null) {
      const seed = await prisma.seed.findUnique({ where: { id } })
      if (seed) {
        update.successRate = seed.totalCount > 0
          ? Math.round((data.germinatedCount / (data.germinatedCount + data.failedCount)) * 100)
          : 0
      }
    }
    await prisma.seed.update({ where: { id }, data: update })
    revalidatePath("/seeds")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to record germination" }
  }
}

export async function advanceSeedStage(id: string, stage: string): Promise<ActionResult> {
  try {
    await prisma.seed.update({ where: { id }, data: { stage: stage as any } })
    revalidatePath("/seeds")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update stage" }
  }
}

export async function deleteSeed(id: string): Promise<ActionResult> {
  try {
    await prisma.seed.update({ where: { id }, data: { deletedAt: new Date() } })
    auditLog({ action: "delete", entity: "Seed", entityId: id })
    revalidatePath("/seeds")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete seed batch" }
  }
}

export async function createSeedlingsFromSeed(seedId: string, count: number): Promise<ActionResult<{ seedlingIds: string[] }>> {
  try {
    const seed = await prisma.seed.findUnique({
      where: { id: seedId },
      include: { cross: { include: { seedParent: true, pollenParent: true } } },
    })
    if (!seed) return { success: false, error: "Seed batch not found" }

    const existing = await prisma.seedling.count({ where: { seedId } })
    const seedlingIds: string[] = []

    const batchPrefix = seed.batchNumber
      ? seed.batchNumber.replace("B", "")
      : `${seed.cross?.seedParent?.name?.slice(0, 3).toUpperCase() ?? "UNK"}${seed.cross?.pollenParent?.name?.slice(0, 3).toUpperCase() ?? "UNK"}`

    const seedlings = Array.from({ length: count }, (_, i) => {
      const sid = `${batchPrefix}-${String(existing + i + 1).padStart(3, "0")}`
      seedlingIds.push(sid)
      return {
        seedlingId: sid,
        year: new Date().getFullYear(),
        crossId: seed.crossId,
        seedId: seed.id,
        speciesId: seed.speciesId,
        generation: "F1",
        crossNumber: seed.cross?.crossNumber,
        seedParentId: seed.cross?.seedParentId,
        crossParentId: seed.cross?.pollenParentId,
        disposition: "KEPT" as any,
      }
    })

    await prisma.seedling.createMany({ data: seedlings })

    await prisma.seed.update({
      where: { id: seedId },
      data: { germinatedCount: (seed.germinatedCount ?? 0) + count, stage: "GERMINATED" },
    })

    revalidatePath("/seeds")
    revalidatePath("/seedlings")
    return { success: true, data: { seedlingIds } }
  } catch (error) {
    return { success: false, error: "Failed to create seedlings" }
  }
}
