import { getSpecies } from "@/server/actions/species"
import { SpeciesClient } from "./client"

export default async function SpeciesPage() {
  const species = await getSpecies()
  return <SpeciesClient species={species} />
}
