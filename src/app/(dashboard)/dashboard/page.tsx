import { getDashboardStats } from "@/server/actions/dashboard"
import { getAnalytics } from "@/server/actions/analytics"
import { DashboardClient } from "./client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [stats, analytics] = await Promise.all([getDashboardStats(), getAnalytics()])
  return <DashboardClient stats={stats} analytics={analytics} />
}
