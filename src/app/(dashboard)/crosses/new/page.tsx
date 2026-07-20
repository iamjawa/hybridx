import { getSpecies } from "@/server/actions/species"
import { getPlants } from "@/server/actions/plants"
import { CrossNewClient } from "./client"

export const dynamic = "force-dynamic"

export default async function NewCrossPage() {
  const species = await getSpecies()
  const { plants } = await getPlants({ limit: 200 })
  return <CrossNewClient species={species} plants={plants} />
}
