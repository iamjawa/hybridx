"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"
import { auditLog } from "@/lib/audit"
import { requireUserId } from "@/lib/require-user"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { CreateGoalSchema } from "@/lib/validations"
import { z } from "zod/v4"

type GoalCriterion = {
  traitId?: string
  traitName: string
  targetValue: string | number
  weight: number
  type: string
  operator?: "equals" | "contains" | "gte" | "lte"
}

export async function getGoals(params?: { speciesId?: string; isActive?: boolean }) {
  const userId = await requireUserId()
  const where: any = { createdById: userId }
  if (params?.speciesId) where.speciesId = params.speciesId
  if (params?.isActive != null) where.isActive = params.isActive
  return prisma.breedingGoal.findMany({
    where,
    include: { species: true, _count: { select: { scores: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getGoalById(id: string) {
  return prisma.breedingGoal.findUnique({
    where: { id },
    include: {
      species: true,
      scores: {
        include: {
          plant: { include: { species: true } },
          seedling: { include: { cross: { include: { seedParent: true, pollenParent: true } } } },
        },
        orderBy: { overallScore: "desc" },
        take: 50,
      },
    },
  })
}

export async function createGoal(data: {
  name: string
  description?: string
  speciesId?: string
  criteria: GoalCriterion[]
}): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const parsed = CreateGoalSchema.parse(data)
    const goal = await prisma.breedingGoal.create({
      data: { ...parsed, createdById: userId },
    })
    auditLog({ action: "create", entity: "BreedingGoal", entityId: goal.id })
    trackEvent(EVENTS.GOAL_CREATED, { name: parsed.name })
    revalidatePath("/goals")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) return { success: false, error: error.issues.map(e => e.message).join(", ") }
    return { success: false, error: "Failed to create breeding goal" }
  }
}

export async function updateGoal(id: string, data: { name?: string; description?: string; criteria?: GoalCriterion[]; isActive?: boolean }): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.breedingGoal.findFirst({ where: { id, createdById: userId } })
    if (!existing) return { success: false, error: "Goal not found" }
    await prisma.breedingGoal.update({ where: { id }, data })
    auditLog({ action: "update", entity: "BreedingGoal", entityId: id })
    revalidatePath("/goals")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update breeding goal" }
  }
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId()
    const existing = await prisma.breedingGoal.findFirst({ where: { id, createdById: userId } })
    if (!existing) return { success: false, error: "Goal not found" }
    await prisma.breedingGoal.delete({ where: { id } })
    auditLog({ action: "delete", entity: "BreedingGoal", entityId: id })
    revalidatePath("/goals")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete breeding goal" }
  }
}

function scoreCriterion(value: any, criterion: GoalCriterion): number {
  if (value == null) return 0

  const target = criterion.targetValue
  const op = criterion.operator ?? "equals"

  switch (criterion.type) {
    case "BOOLEAN":
    case "YES_NO":
      return String(value).toLowerCase() === String(target).toLowerCase() ? 100 : 0

    case "SCALE_1_5": {
      const v = Number(value); const t = Number(target)
      if (isNaN(v) || isNaN(t)) return 0
      if (op === "gte") return v >= t ? 100 : Math.max(0, (v / t) * 100)
      if (op === "lte") return v <= t ? 100 : Math.max(0, (t / v) * 100)
      const diff = Math.abs(v - t)
      return Math.max(0, 100 - diff * 25)
    }

    case "SCALE_1_10":
    case "PERCENTAGE": {
      const v = Number(value); const t = Number(target)
      if (isNaN(v) || isNaN(t)) return 0
      if (op === "gte") return v >= t ? 100 : Math.max(0, (v / t) * 100)
      if (op === "lte") return v <= t ? 100 : Math.max(0, (t / v) * 100)
      const diff = Math.abs(v - t)
      return Math.max(0, 100 - diff * 12.5)
    }

    case "NUMERIC": {
      const v = Number(value); const t = Number(target)
      if (isNaN(v) || isNaN(t)) return 0
      if (op === "gte") return v >= t ? 100 : Math.max(0, (v / t) * 100)
      if (op === "lte") return v <= t ? 100 : Math.max(0, (t / v) * 100)
      return v === t ? 100 : 0
    }

    case "TEXT":
    default: {
      const vs = String(value).toLowerCase(); const ts = String(target).toLowerCase()
      if (op === "contains") return vs.includes(ts) ? 100 : 0
      return vs === ts ? 100 : vs.includes(ts) ? 80 : 0
    }
  }
}

function extractValue(entity: any, traitName: string, _type: string): any {
  if (entity.traitValues) {
    const tv = entity.traitValues.find((t: any) => t.trait?.name?.toLowerCase() === traitName.toLowerCase())
    if (tv) return tv.value
  }

  const fieldMap: Record<string, string> = {
    colour: "colour",
    fragrance: "fragrance",
    "disease resistance": "diseaseResistance",
    "repeat flowering": "repeatFlowering",
    health: "health",
    "bloom size": "bloomSize",
    "petal count": "petalCount",
    height: "height",
  }

  const field = fieldMap[traitName.toLowerCase()]
  if (field && entity[field] != null) return entity[field]

  return null
}

export async function runGoalMatching(goalId: string, entityType: "plant" | "seedling"): Promise<ActionResult<{ scored: number }>> {
  try {
    const goal = await prisma.breedingGoal.findUnique({ where: { id: goalId } })
    if (!goal) return { success: false, error: "Goal not found" }
    const criteria = goal.criteria as unknown as GoalCriterion[]
    if (!criteria.length) return { success: false, error: "Goal has no criteria" }

    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0)
    if (totalWeight <= 0) return { success: false, error: "Goal criteria weights must sum to > 0" }

    const entities = entityType === "plant"
      ? await prisma.plant.findMany({
          where: { speciesId: goal.speciesId ?? undefined },
          include: { traitValues: { include: { trait: true } } },
        })
      : await prisma.seedling.findMany({
          where: { speciesId: goal.speciesId ?? undefined },
          include: { traitValues: { include: { trait: true } } },
        })

    const scores = entities.map((entity) => {
      const breakdown: { traitName: string; score: number; weight: number }[] = []

      for (const c of criteria) {
        const value = extractValue(entity, c.traitName, c.type)
        const score = scoreCriterion(value, c)
        breakdown.push({ traitName: c.traitName, score: Math.round(score), weight: c.weight })
      }

      const weightedSum = breakdown.reduce((s, b) => s + (b.score * b.weight) / 100, 0)
      const overallScore = Math.round((weightedSum / totalWeight) * 100)

      return {
        goalId: goal.id,
        plantId: entityType === "plant" ? entity.id : undefined,
        seedlingId: entityType === "seedling" ? entity.id : undefined,
        overallScore: Math.min(100, Math.max(0, overallScore)),
        breakdown: breakdown as any,
      }
    }).filter((s) => s.overallScore > 0)

    await prisma.breedingGoalScore.deleteMany({
      where: { goalId, plantId: entityType === "plant" ? { not: null } : undefined, seedlingId: entityType === "seedling" ? { not: null } : undefined },
    })

    if (scores.length > 0) {
      await prisma.breedingGoalScore.createMany({ data: scores as any })
    }

    revalidatePath("/goals")
    return { success: true, data: { scored: scores.length } }
  } catch (error) {
    return { success: false, error: "Failed to run goal matching" }
  }
}

export async function getGoalMatchForEntity(entityType: "plant" | "seedling", entityId: string) {
  const where = entityType === "plant" ? { plantId: entityId } : { seedlingId: entityId }
  return prisma.breedingGoalScore.findMany({
    where,
    include: { goal: { include: { species: true } } },
    orderBy: { overallScore: "desc" },
  })
}
