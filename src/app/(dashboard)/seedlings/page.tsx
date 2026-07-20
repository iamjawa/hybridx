import { getSeedlings } from "@/server/actions/seedlings"
import { getSpecies } from "@/server/actions/species"
import { SeedlingsClient } from "./client"

export const dynamic = "force-dynamic"

export default async function SeedlingsPage() {
  const [{ seedlings, total, pages }, species] = await Promise.all([
    getSeedlings(),
    getSpecies(),
  ])
  return <SeedlingsClient initialSeedlings={seedlings} total={total} pages={pages} species={species} />
}
