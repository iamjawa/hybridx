import { getSpeciesById } from "@/server/actions/species"
import { SpeciesDetailClient } from "./client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SpeciesDetailPage({ params }: any) {
  const { id } = await params
  const species = await getSpeciesById(id)
  if (!species) notFound()
  return <SpeciesDetailClient species={species} />
}
