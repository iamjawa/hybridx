"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"
import { auditLog } from "@/lib/audit"
import { requireUserId } from "@/lib/require-user"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { CreatePlantSchema } from "@/lib/validations"
import { z } from "zod/v4"

export async function getPlants(params?: {
  speciesId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { speciesId, status, search, page = 1, limit = 20 } = params || {}
  const userId = await requireUserId()
  const where: any = { deletedAt: null, breederId: userId }
  if (speciesId) where.speciesId = speciesId
  if (status) where.status = status.toUpperCase()
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { varietyName: { contains: search, mode: "insensitive" } },
    ]
  }
  const [plants, total] = await Promise.all([
    prisma.plant.findMany({
      where,
      include: {
        species: true,
        images: { where: { isPrimary: true }, take: 1 },
        traitValues: { include: { trait: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.plant.count({ where }),
  ])
  return { plants, total, pages: Math.ceil(total / limit) }
}

export async function getPlantById(id: string) {
  const userId = await requireUserId()
  return prisma.plant.findFirst({
    where: { id, breederId: userId },
    include: {
      species: true,
      images: true,
      traitValues: { include: { trait: true } },
      crossesAsSeedParent: { include: { pollenParent: true }, take: 10 },
      crossesAsPollenParent: { include: { seedParent: true }, take: 10 },
      seedlingsFrom: { take: 10, orderBy: { year: "desc" } },
      seedlingCrosses: { take: 10, orderBy: { year: "desc" } },
      location: true,
      note: { orderBy: { createdAt: "desc" } },
      tasks: { where: { completed: false } },
      goalScores: { include: { goal: true }, orderBy: { overallScore: "desc" } },
    },
  })
}

export async function createPlant(data: {
  name: string
  varietyName?: string
  speciesId?: string
  description?: string
  origin?: string
  year?: number
  colour?: string
  fragrance?: string
  diseaseResistance?: string
  repeatFlowering?: boolean
  status?: string
}): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const parsed = CreatePlantSchema.parse(data)
    const plant = await prisma.plant.create({
      data: { ...parsed, breederId: userId, status: (data.status ?? "ACTIVE") as any },
    })
    auditLog({ action: "create", entity: "Plant", entityId: plant.id, metadata: { name: parsed.name } })
    trackEvent(EVENTS.PLANT_CREATED, { name: parsed.name })
    revalidatePath("/plants")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to create plant" }
  }
}

export async function updatePlant(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.plant.findFirst({ where: { id, breederId: userId } })
    if (!existing) return { success: false, error: "Plant not found" }
    await prisma.plant.update({ where: { id }, data })
    auditLog({ action: "update", entity: "Plant", entityId: id })
    revalidatePath("/plants")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update plant" }
  }
}

export async function deletePlant(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.plant.findFirst({ where: { id, breederId: userId } })
    if (!existing) return { success: false, error: "Plant not found" }
    await prisma.plant.update({ where: { id }, data: { deletedAt: new Date() } })
    auditLog({ action: "delete", entity: "Plant", entityId: id })
    revalidatePath("/plants")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete plant" }
  }
}
