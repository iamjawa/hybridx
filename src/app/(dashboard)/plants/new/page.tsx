import { getSpecies } from "@/server/actions/species"
import { PlantNewClient } from "./client"

export const dynamic = "force-dynamic"

export default async function NewPlantPage() {
  const species = await getSpecies()
  return <PlantNewClient species={species} />
}
