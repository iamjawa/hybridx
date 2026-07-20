"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getNotes(plantId?: string) {
  const where: any = {}
  if (plantId) where.plantId = plantId
  return prisma.note.findMany({
    where,
    include: { createdBy: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createNote(data: {
  content: string
  title?: string
  plantId?: string
  isPrivate?: boolean
  tags?: string[]
}): Promise<ActionResult> {
  try {
    await prisma.note.create({ data })
    if (data.plantId) revalidatePath(`/plants/${data.plantId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create note" }
  }
}

export async function deleteNote(id: string, plantId?: string): Promise<ActionResult> {
  try {
    await prisma.note.delete({ where: { id } })
    if (plantId) revalidatePath(`/plants/${plantId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete note" }
  }
}
