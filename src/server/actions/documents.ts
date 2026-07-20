"use server"

import { prisma } from "@/lib/prisma"
import { requireUserId } from "@/lib/require-user"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getDocuments(plantId: string) {
  return prisma.document.findMany({ where: { plantId }, orderBy: { createdAt: "desc" } })
}

export async function createDocument(data: {
  title: string
  url: string
  mimeType?: string
  plantId: string
}): Promise<ActionResult> {
  try {
    await requireUserId()
    await prisma.document.create({ data })
    revalidatePath(`/plants/${data.plantId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create document" }
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  try {
    await requireUserId()
    await prisma.document.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete document" }
  }
}
