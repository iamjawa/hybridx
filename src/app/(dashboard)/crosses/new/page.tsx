import { getSpecies } from "@/server/actions/species"
import { getPlants } from "@/server/actions/plants"
import { CrossNewClient } from "./client"

export const dynamic = "force-dynamic"

export default async function NewCrossPage(props: { searchParams: Promise<{ seedParentId?: string; pollenParentId?: string }> }) {
  const { seedParentId, pollenParentId } = await props.searchParams
  const species = await getSpecies()
  const { plants } = await getPlants({ limit: 200 })
  return <CrossNewClient species={species} plants={plants} defaultSeedParentId={seedParentId} defaultPollenParentId={pollenParentId} />
}
