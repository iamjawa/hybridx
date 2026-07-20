import { getPlants } from "@/server/actions/plants"
import { CrossPlannerClient } from "./client"

export const dynamic = "force-dynamic"

export default async function CrossPlannerPage() {
  const { plants } = await getPlants({ limit: 200 })
  return <CrossPlannerClient plants={plants} />
}
