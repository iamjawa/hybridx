"use server"

import { prisma } from "@/lib/prisma"
import { requireUserId } from "@/lib/require-user"
import type { ActionResult } from "@/lib/types"

export async function getTraitValues(entityType: "plant" | "seedling", entityId: string) {
  const where = entityType === "plant" ? { plantId: entityId } : { seedlingId: entityId }
  return prisma.traitValue.findMany({
    where,
    include: { trait: true },
  })
}

export async function upsertTraitValue(data: {
  traitId: string
  plantId?: string
  seedlingId?: string
  value: any
  note?: string
}): Promise<ActionResult> {
  try {
    await requireUserId()
    const existing = await prisma.traitValue.findFirst({
      where: {
        traitId: data.traitId,
        plantId: data.plantId ?? undefined,
        seedlingId: data.seedlingId ?? undefined,
      },
    })
    if (existing) {
      await prisma.traitValue.update({
        where: { id: existing.id },
        data: { value: data.value, note: data.note },
      })
    } else {
      await prisma.traitValue.create({
        data: {
          traitId: data.traitId,
          plantId: data.plantId,
          seedlingId: data.seedlingId,
          value: data.value,
          note: data.note,
        },
      })
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to save trait value" }
  }
}
