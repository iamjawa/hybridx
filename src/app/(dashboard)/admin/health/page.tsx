import { prisma } from "@/lib/prisma"
import { HealthClient } from "./client"
import { requireUserId } from "@/lib/require-user"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: "ok" as const }
  } catch (e) {
    return { status: "error" as const, message: (e as Error).message }
  }
}

async function checkAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { status: "error" as const, message: "Auth env vars missing" }
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    return { status: res.ok ? ("ok" as const) : ("error" as const), message: res.ok ? undefined : `HTTP ${res.status}` }
  } catch {
    return { status: "error" as const, message: "Cannot reach Supabase Auth" }
  }
}

export default async function HealthPage() {
  const userId = await requireUserId()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user?.role !== "ADMIN") notFound()

  const [db, auth, plantCount, crossCount, seedlingCount, seedCount, evaluationCount, goalCount, feedbackCount, eventCount] = await Promise.all([
    checkDatabase(),
    checkAuth(),
    prisma.plant.count().catch(() => -1),
    prisma.cross.count().catch(() => -1),
    prisma.seedling.count().catch(() => -1),
    prisma.seed.count().catch(() => -1),
    prisma.evaluation.count().catch(() => -1),
    prisma.breedingGoal.count().catch(() => -1),
    prisma.feedback.count().catch(() => -1),
    prisma.analyticsEvent.count().catch(() => -1),
  ])

  const latestFeedback = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 5 }).catch(() => [])
  const latestEvents = await prisma.analyticsEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 }).catch(() => [])

  return (
    <HealthClient
      db={db}
      auth={auth}
      counts={{ plantCount, crossCount, seedlingCount, seedCount, evaluationCount, goalCount }}
      feedbackCount={feedbackCount}
      eventCount={eventCount}
      latestFeedback={latestFeedback}
      latestEvents={latestEvents}
    />
  )
}
