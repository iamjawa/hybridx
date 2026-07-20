import { getGoals } from "@/server/actions/goals"
import { getSpecies } from "@/server/actions/species"
import { GoalsClient } from "./client"

export const dynamic = "force-dynamic"

export default async function GoalsPage() {
  const [goals, species] = await Promise.all([getGoals(), getSpecies()])
  return <GoalsClient goals={goals} species={species} />
}
