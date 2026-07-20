"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"
import { auditLog } from "@/lib/audit"
import { requireUserId } from "@/lib/require-user"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { CreateCrossSchema } from "@/lib/validations"
import { z } from "zod/v4"

export async function getCrosses(params?: {
  speciesId?: string
  seedParentId?: string
  pollenParentId?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { speciesId, seedParentId, pollenParentId, search, page = 1, limit = 20 } = params || {}
  const userId = await requireUserId()
  const where: any = { deletedAt: null, createdById: userId }
  if (speciesId) where.speciesId = speciesId
  if (seedParentId) where.seedParentId = seedParentId
  if (pollenParentId) where.pollenParentId = pollenParentId
  if (search) {
    where.OR = [
      { crossNumber: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
      { seedParent: { name: { contains: search, mode: "insensitive" } } },
      { pollenParent: { name: { contains: search, mode: "insensitive" } } },
    ]
  }
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
      seeds: { orderBy: { createdAt: "desc" } },
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
    const userId = await requireUserId()
    const parsed = CreateCrossSchema.parse(data)
    const cross = await prisma.cross.create({
      data: { ...parsed, createdById: userId, method: (data.method ?? "MANUAL") as any },
    })
    auditLog({ action: "create", entity: "Cross", entityId: cross.id })
    trackEvent(EVENTS.CROSS_CREATED, { crossNumber: data.crossNumber })
    revalidatePath("/crosses")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to create cross" }
  }
}

export async function updateCross(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.cross.findFirst({ where: { id, createdById: userId } })
    if (!existing) return { success: false, error: "Cross not found" }
    await prisma.cross.update({ where: { id }, data })
    auditLog({ action: "update", entity: "Cross", entityId: id })
    revalidatePath("/crosses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update cross" }
  }
}

export async function deleteCross(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.cross.findFirst({ where: { id, createdById: userId } })
    if (!existing) return { success: false, error: "Cross not found" }
    await prisma.cross.update({ where: { id }, data: { deletedAt: new Date() } })
    auditLog({ action: "delete", entity: "Cross", entityId: id })
    revalidatePath("/crosses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete cross" }
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
