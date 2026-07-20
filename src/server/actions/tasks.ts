"use server"

import { prisma } from "@/lib/prisma"
import { requireUserId } from "@/lib/require-user"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getTasks(entityType: "plant" | "cross", entityId: string) {
  const where = entityType === "plant" ? { plantId: entityId } : { crossId: entityId }
  return prisma.task.findMany({ where, orderBy: { createdAt: "desc" } })
}

export async function createTask(data: {
  title: string
  dueDate?: string
  plantId?: string
  crossId?: string
}): Promise<ActionResult> {
  try {
    await requireUserId()
    const task = await prisma.task.create({
      data: {
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        plantId: data.plantId,
        crossId: data.crossId,
      },
    })
    revalidatePath(data.plantId ? `/plants/${data.plantId}` : `/crosses/${data.crossId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create task" }
  }
}

export async function toggleTask(id: string, completed: boolean): Promise<ActionResult> {
  try {
    await requireUserId()
    await prisma.task.update({
      where: { id },
      data: { completed, completedAt: completed ? new Date() : null },
    })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update task" }
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    await requireUserId()
    await prisma.task.delete({ where: { id } })
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete task" }
  }
}
