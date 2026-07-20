import { getGoalById } from "@/server/actions/goals"
import { GoalDetailClient } from "./client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function GoalDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const goal = await getGoalById(id)
  if (!goal) notFound()
  return <GoalDetailClient goal={goal} />
}
