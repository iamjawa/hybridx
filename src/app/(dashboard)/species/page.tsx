import { getSpecies } from "@/server/actions/species"
import { SpeciesClient } from "./client"

export const dynamic = "force-dynamic"

export default async function SpeciesPage() {
  const species = await getSpecies()
  return <SpeciesClient species={species} />
}
