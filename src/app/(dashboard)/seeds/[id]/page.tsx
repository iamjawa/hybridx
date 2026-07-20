import { getSeedById } from "@/server/actions/seeds"
import { SeedDetailClient } from "./client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function SeedDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const seed = await getSeedById(id)
  if (!seed) notFound()
  return <SeedDetailClient seed={seed} />
}
