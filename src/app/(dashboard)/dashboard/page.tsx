import { getDashboardStats } from "@/server/actions/dashboard"
import { DashboardClient } from "./client"

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  return <DashboardClient stats={stats} />
}
