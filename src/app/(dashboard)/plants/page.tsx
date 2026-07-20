import { getPlants } from "@/server/actions/plants"
import { getSpecies } from "@/server/actions/species"
import { PlantsClient } from "./client"

export default async function PlantsPage() {
  const [{ plants, total, pages }, species] = await Promise.all([
    getPlants(),
    getSpecies(),
  ])
  return <PlantsClient initialPlants={plants} total={total} pages={pages} species={species} />
}
