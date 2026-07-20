import { getSeedlings } from "@/server/actions/seedlings"
import { getSpecies } from "@/server/actions/species"
import { EvaluationClient } from "./client"

export const dynamic = "force-dynamic"

export default async function EvaluationPage() {
  const [{ seedlings }, species] = await Promise.all([
    getSeedlings({ limit: 50 }),
    getSpecies(),
  ])
  return <EvaluationClient seedlings={seedlings} species={species} />
}
