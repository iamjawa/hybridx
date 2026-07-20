import { getDashboardStats } from "@/server/actions/dashboard"
import { DashboardClient } from "./client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <DashboardClient stats={stats} />
}
