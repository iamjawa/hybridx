"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  const [
    plantCount,
    crossCount,
    seedlingCount,
    speciesCount,
    recentPlants,
    recentCrosses,
    recentSeedlings,
    upcomingTasks,
    thisYearSeedlings,
  ] = await Promise.all([
    prisma.plant.count(),
    prisma.cross.count(),
    prisma.seedling.count(),
    prisma.species.count(),
    prisma.plant.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { species: true, images: { where: { isPrimary: true }, take: 1 } } }),
    prisma.cross.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { seedParent: true, pollenParent: true } }),
    prisma.seedling.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { cross: { include: { seedParent: true, pollenParent: true } }, images: { where: { isPrimary: true }, take: 1 } } }),
    prisma.task.findMany({ where: { completed: false, dueDate: { not: null } }, orderBy: { dueDate: "asc" }, take: 10 }),
    prisma.seedling.count({ where: { year: new Date().getFullYear() } }),
  ])

  return {
    plantCount,
    crossCount,
    seedlingCount,
    speciesCount,
    recentPlants,
    recentCrosses,
    recentSeedlings,
    upcomingTasks,
    thisYearSeedlings,
    germinationRate: seedlingCount > 0 ? Math.round((thisYearSeedlings / Math.max(plantCount, 1)) * 100) : 0,
  }
}
