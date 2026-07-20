"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getPlants(params?: {
  speciesId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { speciesId, status, search, page = 1, limit = 20 } = params || {}
  const where: any = {}
  if (speciesId) where.speciesId = speciesId
  if (status) where.status = status
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
  return prisma.plant.findUnique({
    where: { id },
    include: {
      species: true,
      images: true,
      traitValues: { include: { trait: true } },
      crossesAsSeedParent: { include: { pollenParent: true }, take: 10 },
      crossesAsPollenParent: { include: { seedParent: true }, take: 10 },
      seedlingsFrom: { take: 10, orderBy: { year: "desc" } },
      seedlingCrosses: { take: 10, orderBy: { year: "desc" } },
      location: true,
      note: true,
      tasks: { where: { completed: false } },
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
    await prisma.plant.create({
      data: {
        name: data.name,
        varietyName: data.varietyName,
        speciesId: data.speciesId,
        description: data.description,
        origin: data.origin,
        year: data.year,
        colour: data.colour,
        fragrance: data.fragrance,
        diseaseResistance: data.diseaseResistance,
        repeatFlowering: data.repeatFlowering,
        status: data.status as any ?? "ACTIVE",
      },
    })
    revalidatePath("/plants")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create plant" }
  }
}

export async function updatePlant(id: string, data: Record<string, any>): Promise<ActionResult> {
  try {
    await prisma.plant.update({ where: { id }, data })
    revalidatePath("/plants")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update plant" }
  }
}

export async function deletePlant(id: string): Promise<ActionResult> {
  try {
    await prisma.plant.delete({ where: { id } })
    revalidatePath("/plants")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete plant" }
  }
}
