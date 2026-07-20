import { getSpecies } from "@/server/actions/species"
import { OnboardingClient } from "./client"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const species = await getSpecies()
  return <OnboardingClient species={species} />
}
