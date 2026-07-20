import { getSpecies } from "@/server/actions/species"
import { getCrosses } from "@/server/actions/crosses"
import { SeedlingNewClient } from "./client"

export const dynamic = "force-dynamic"

export default async function NewSeedlingPage() {
  const species = await getSpecies()
  const { crosses } = await getCrosses({ limit: 200 })
  return <SeedlingNewClient species={species} crosses={crosses} />
}
