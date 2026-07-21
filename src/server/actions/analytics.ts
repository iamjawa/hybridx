"use server"

import { prisma } from "@/lib/prisma"
import { requireUserId } from "@/lib/require-user"

export async function getAnalytics() {
  const userId = await requireUserId()
  const thisYear = new Date().getFullYear()

  const [crossesByMonth, dispositionCounts, evaluationDistribution, topParents] = await Promise.all([
    prisma.cross.groupBy({
      by: ["createdAt"],
      where: { createdById: userId, createdAt: { gte: new Date(`${thisYear}-01-01`) } },
      _count: { id: true },
    }),
    prisma.seedling.groupBy({
      by: ["disposition"],
      where: { createdById: userId },
      _count: { id: true },
    }),
    prisma.evaluation.findMany({
      where: { evaluatorId: userId },
      select: { totalScore: true },
      orderBy: { totalScore: "asc" },
    }),
    prisma.plant.findMany({
      where: {
        breederId: userId,
        OR: [
          { crossesAsSeedParent: { some: {} } },
          { crossesAsPollenParent: { some: {} } },
        ],
      },
      include: {
        _count: { select: { crossesAsSeedParent: true, crossesAsPollenParent: true } },
      },
      orderBy: { crossesAsSeedParent: { _count: "desc" } },
      take: 5,
    }),
  ])

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(thisYear, i, 1)
    const count = crossesByMonth.filter((c) => {
      const d = new Date(c.createdAt)
      return d.getMonth() === i
    }).reduce((sum, c) => sum + c._count.id, 0)
    return { month: month.toLocaleString("default", { month: "short" }), count }
  })

  const dispositions = dispositionCounts.map((d) => ({
    disposition: d.disposition ?? "UNSET",
    count: d._count.id,
  }))

  const scores = evaluationDistribution.map((e) => e.totalScore).filter((s): s is number => s != null)

  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0

  return { months, dispositions, scores, avgScore, scoreCount: scores.length, topParents }
}
