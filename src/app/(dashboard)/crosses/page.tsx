import { getCrosses } from "@/server/actions/crosses"
import { getSpecies } from "@/server/actions/species"
import { getPlants } from "@/server/actions/plants"
import { CrossesClient } from "./client"

export default async function CrossesPage() {
  const [{ crosses, total, pages }, species, { plants }] = await Promise.all([
    getCrosses(),
    getSpecies(),
    getPlants({ limit: 100 }),
  ])
  return <CrossesClient initialCrosses={crosses} total={total} pages={pages} species={species} plants={plants} />
}
