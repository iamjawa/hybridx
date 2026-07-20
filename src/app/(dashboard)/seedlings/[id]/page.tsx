import { getSeedlingById } from "@/server/actions/seedlings"
import { SeedlingDetailClient } from "./client"
import { notFound } from "next/navigation"

export default async function SeedlingDetailPage({ params }: any) {
  const { id } = await params
  const seedling = await getSeedlingById(id)
  if (!seedling) notFound()
  return <SeedlingDetailClient seedling={seedling} />
}
