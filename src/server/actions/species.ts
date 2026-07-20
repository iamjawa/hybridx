"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"

export async function getSpecies() {
  return prisma.species.findMany({
    orderBy: { name: "asc" },
    include: { traits: { orderBy: { sortOrder: "asc" } } },
  })
}

export async function getSpeciesBySlug(slug: string) {
  return prisma.species.findUnique({
    where: { slug },
    include: { traits: { orderBy: { sortOrder: "asc" } } },
  })
}

export async function getSpeciesById(id: string) {
  return prisma.species.findUnique({
    where: { id },
    include: { traits: { orderBy: { sortOrder: "asc" } } },
  })
}

export async function createSpecies(data: {
  name: string
  slug: string
  description?: string
  generationLabels?: string[]
  flowerFormOptions?: string[]
}): Promise<ActionResult> {
  try {
    await prisma.species.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        generationLabels: data.generationLabels ?? ["F1", "F2", "F3", "F4", "F5", "BC1", "BC2"],
        flowerFormOptions: data.flowerFormOptions ?? [],
      },
    })
    revalidatePath("/species")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create species" }
  }
}

export async function updateSpecies(
  id: string,
  data: {
    name?: string
    description?: string
    colorSystem?: Record<string, string>
    flowerFormOptions?: string[]
    generationLabels?: string[]
    breedingTerminology?: Record<string, string>
    pollenViability?: number
    seedViability?: number
  }
): Promise<ActionResult> {
  try {
    await prisma.species.update({ where: { id }, data })
    revalidatePath("/species")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update species" }
  }
}

export async function deleteSpecies(id: string): Promise<ActionResult> {
  try {
    await prisma.species.delete({ where: { id } })
    revalidatePath("/species")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete species" }
  }
}

export async function createTrait(data: {
  speciesId: string
  name: string
  slug: string
  description?: string
  type?: string
  category?: string
  sortOrder?: number
  options?: string[]
}): Promise<ActionResult> {
  try {
    await prisma.traitDefinition.create({ data: { ...data, type: data.type as any } })
    revalidatePath("/species")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create trait" }
  }
}

export async function deleteTrait(id: string): Promise<ActionResult> {
  try {
    await prisma.traitDefinition.delete({ where: { id } })
    revalidatePath("/species")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete trait" }
  }
}
