import { SearchClient } from "./client"

export const dynamic = "force-dynamic"

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await props.searchParams
  return <SearchClient initialQuery={q ?? ""} />
}
