import { getSeeds } from "@/server/actions/seeds"
import { getSpecies } from "@/server/actions/species"
import { SeedsClient } from "./client"

export const dynamic = "force-dynamic"

export default async function SeedsPage(props: { searchParams: Promise<{ stage?: string; search?: string }> }) {
  const { stage, search } = await props.searchParams
  const [{ seeds, total, pages }, species] = await Promise.all([
    getSeeds({ stage: stage || undefined, search: search || undefined }),
    getSpecies(),
  ])
  return <SeedsClient initialSeeds={seeds} total={total} pages={pages} species={species} initialStage={stage ?? ""} initialSearch={search ?? ""} />
}
