"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function addImage(data: {
  url: string
  thumbnail?: string
  alt?: string
  plantId?: string
  seedlingId?: string
  isPrimary?: boolean
}): Promise<ActionResult> {
  try {
    await prisma.image.create({ data })
    if (data.plantId) revalidatePath(`/plants/${data.plantId}`)
    if (data.seedlingId) revalidatePath(`/seedlings/${data.seedlingId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to add image" }
  }
}

export async function setPrimaryImage(imageId: string, entityType: "plant" | "seedling", entityId: string): Promise<ActionResult> {
  try {
    const idField = entityType === "plant" ? "plantId" : "seedlingId"
    await prisma.image.updateMany({ where: { [idField]: entityId, isPrimary: true }, data: { isPrimary: false } })
    await prisma.image.update({ where: { id: imageId }, data: { isPrimary: true } })
    revalidatePath(`/${entityType}s/${entityId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to set primary image" }
  }
}

export async function deleteImage(id: string, plantId?: string, seedlingId?: string): Promise<ActionResult> {
  try {
    await prisma.image.delete({ where: { id } })
    if (plantId) revalidatePath(`/plants/${plantId}`)
    if (seedlingId) revalidatePath(`/seedlings/${seedlingId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete image" }
  }
}
