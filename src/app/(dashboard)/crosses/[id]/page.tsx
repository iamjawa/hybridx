import { getCrossById } from "@/server/actions/crosses"
import { CrossDetailClient } from "./client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CrossDetailPage({ params }: any) {
  const { id } = await params
  const cross = await getCrossById(id)
  if (!cross) notFound()
  return <CrossDetailClient cross={cross} />
}
