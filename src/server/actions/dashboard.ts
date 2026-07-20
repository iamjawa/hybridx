"use server"

import { prisma } from "@/lib/prisma"
import type { SeedStage } from "@/generated/prisma/client"
import { requireUserId } from "@/lib/require-user"

export async function getDashboardStats() {
  const userId = await requireUserId()
  const now = new Date()
  const thisYear = now.getFullYear()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const stratifyingStages: SeedStage[] = ["STRATIFYING", "COLD_STRATIFYING", "WARM_STRATIFYING"]

  const [
    plantCount,
    crossCount,
    seedlingCount,
    seedCount,
    speciesCount,
    evaluationCount,

    thisYearCrosses,
    thisYearSeedlings,
    thisYearSeeds,

    seedsStratifying,
    stratificationsEndingSoon,
    unevaluatedSeedlings,
    potentialKeepers,
    goalCount,

    recentActivity,
  ] = await Promise.all([
    prisma.plant.count({ where: { breederId: userId } }),
    prisma.cross.count({ where: { createdById: userId } }),
    prisma.seedling.count({ where: { createdById: userId } }),
    prisma.seed.count(),
    prisma.species.count(),
    prisma.evaluation.count({ where: { evaluatorId: userId } }),
    prisma.breedingGoal.count({ where: { createdById: userId } }),

    prisma.cross.count({ where: { createdById: userId, createdAt: { gte: new Date(`${thisYear}-01-01`) } } }),
    prisma.seedling.count({ where: { createdById: userId, year: thisYear } }),
    prisma.seed.count({ where: { createdAt: { gte: new Date(`${thisYear}-01-01`) } } }),

    prisma.seed.count({ where: { stage: { in: stratifyingStages } } }),
    prisma.seed.count({
      where: {
        stage: { in: stratifyingStages as any },
        stratificationStart: {
          gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.seedling.count({
      where: {
        createdById: userId,
        evaluations: { none: {} },
        disposition: "KEPT",
      },
    }),
    prisma.seedling.count({ where: { createdById: userId, disposition: "SELECTED" } }),

    getRecentActivity(userId),
  ])

  const floweringPlants = await prisma.plant.count({
    where: {
      breederId: userId,
      status: "ACTIVE",
      repeatFlowering: true,
    },
  })

  const selectionRate = seedlingCount > 0
    ? Math.round((potentialKeepers / seedlingCount) * 100)
    : 0
  const evalRate = seedlingCount > 0
    ? Math.round(((seedlingCount - unevaluatedSeedlings) / seedlingCount) * 100)
    : 0

  return {
    plantCount,
    crossCount,
    seedlingCount,
    seedCount,
    speciesCount,
    evaluationCount,

    thisYearCrosses,
    thisYearSeedlings,
    thisYearSeeds,

    seedsStratifying,
    stratificationsEndingSoon,
    unevaluatedSeedlings,
    potentialKeepers,
    floweringPlants,
    goalCount,

    selectionRate,
    evalRate,
    recentActivity,
  }
}

async function getRecentActivity(userId: string) {
  const [recentPlants, recentCrosses, recentSeedlings, recentSeeds, recentEvaluations] = await Promise.all([
    prisma.plant.findMany({
      where: { breederId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { species: true },
    }),
    prisma.cross.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { seedParent: true, pollenParent: true },
    }),
    prisma.seedling.findMany({
      where: { createdById: userId, disposition: "SELECTED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { cross: { include: { seedParent: true, pollenParent: true } } },
    }),
    prisma.seed.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { cross: { include: { seedParent: true, pollenParent: true } } },
    }),
    prisma.evaluation.findMany({
      where: { evaluatorId: userId },
      orderBy: { date: "desc" },
      take: 5,
      include: { seedling: { include: { cross: { include: { seedParent: true, pollenParent: true } } } } },
    }),
  ])

  const items: any[] = []

  recentPlants.forEach((p) => items.push({ type: "plant", date: p.createdAt, label: p.name, id: p.id, href: `/plants/${p.id}`, species: p.species?.name }))
  recentCrosses.forEach((c) => items.push({ type: "cross", date: c.createdAt, label: `${c.seedParent?.name ?? "?"} × ${c.pollenParent?.name ?? "?"}`, id: c.id, href: `/crosses/${c.id}`, crossNumber: c.crossNumber }))
  recentSeedlings.forEach((s) => items.push({ type: "selection", date: s.updatedAt, label: s.seedlingId, id: s.id, href: `/seedlings/${s.id}`, parentage: `${s.cross?.seedParent?.name ?? "?"} × ${s.cross?.pollenParent?.name ?? "?"}` }))
  recentSeeds.forEach((s) => items.push({ type: "seed", date: s.createdAt, label: s.batchNumber ?? "Seed batch", id: s.id, href: `/seeds/${s.id}`, count: s.totalCount }))
  recentEvaluations.forEach((e) => items.push({ type: "evaluation", date: e.date, label: `${e.seedling?.seedlingId ?? "?"}`, id: e.id, href: `/seedlings/${e.seedlingId}`, score: e.totalScore }))

  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  return items.slice(0, 15)
}
