import { getPlantById } from "@/server/actions/plants"
import { notFound } from "next/navigation"
import { PlantDetailClient } from "./client"

export default async function PlantDetailPage({ params }: any) {
  const { id } = await params
  const plant = await getPlantById(id)
  if (!plant) notFound()
  return <PlantDetailClient plant={plant} />
}
