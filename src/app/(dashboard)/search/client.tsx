"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Leaf, GitMerge, Sprout, Database, Flower2, Search as SearchIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import { globalSearch } from "@/server/actions/search"
import { useRouter } from "next/navigation"
import { SEED_STAGE_LABELS } from "@/lib/constants"

function ResultCard({ icon: Icon, title, subtitle, href, badges }: { icon: any; title: string; subtitle?: string; href: string; badges?: React.ReactNode }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-border/80">
        <CardContent className="flex items-center gap-3 p-4">
          <Icon className="size-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {badges && <div className="flex gap-1 shrink-0">{badges}</div>}
        </CardContent>
      </Card>
    </Link>
  )
}

function ResultSection({ title, icon: Icon, results, render }: { title: string; icon: any; results: any[]; render: (item: any) => { title: string; subtitle?: string; href: string; badges?: React.ReactNode } }) {
  if (results.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        {title} ({results.length})
      </div>
      {results.map((item: any, i: number) => {
        const r = render(item)
        return <ResultCard key={`${title}-${i}`} icon={Icon} {...r} />
      })}
    </div>
  )
}

export function SearchClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults(null); return }
    setLoading(true)
    const data = await globalSearch(q)
    setResults(data)
    setLoading(false)
    const params = new URLSearchParams(window.location.search)
    params.set("q", q)
    router.replace(`/search?q=${encodeURIComponent(q)}`)
  }, [router])

  const totalResults = results
    ? results.plants.length + results.crosses.length + results.seedlings.length + results.seeds.length + results.species.length
    : 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">Search across plants, crosses, seedlings, seeds, and species</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder='Try "orange", "Peace", "R-AB-24", "fragrant"...'
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
          autoFocus
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />}
      </div>

      {results && (
        <p className="text-sm text-muted-foreground">{totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</p>
      )}

      {results && totalResults === 0 && (
        <Card><CardContent className="py-12 text-center">
          <SearchIcon className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">No results found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
        </CardContent></Card>
      )}

      {results && totalResults > 0 && (
        <div className="space-y-6">
          <ResultSection title="Plants" icon={Leaf} results={results.plants} render={(p: any) => ({
            title: p.name,
            subtitle: `${p.species?.name ?? ""}${p.year ? ` · ${p.year}` : ""}${p.colour ? ` · ${p.colour}` : ""}`,
            href: `/plants/${p.id}`,
          })} />
          <ResultSection title="Crosses" icon={GitMerge} results={results.crosses} render={(c: any) => ({
            title: `${c.seedParent?.name ?? "?"} × ${c.pollenParent?.name ?? "?"}`,
            subtitle: c.crossNumber ?? "No number",
            href: `/crosses/${c.id}`,
            badges: <Badge variant="outline" className="text-[10px]">{c.method}</Badge>,
          })} />
          <ResultSection title="Seedlings" icon={Sprout} results={results.seedlings} render={(s: any) => ({
            title: s.seedlingId,
            subtitle: `Year ${s.year}${s.colour ? ` · ${s.colour}` : ""}`,
            href: `/seedlings/${s.id}`,
            badges: s.disposition ? <Badge variant="outline" className="text-[10px]">{s.disposition}</Badge> : undefined,
          })} />
          <ResultSection title="Seed Batches" icon={Database} results={results.seeds} render={(s: any) => ({
            title: s.batchNumber ?? "Unnamed batch",
            subtitle: `${s.totalCount} seeds`,
            href: `/seeds/${s.id}`,
            badges: s.stage ? <Badge variant="outline" className="text-[10px]">{SEED_STAGE_LABELS[s.stage as keyof typeof SEED_STAGE_LABELS] ?? s.stage}</Badge> : undefined,
          })} />
          <ResultSection title="Species" icon={Flower2} results={results.species} render={(s: any) => ({
            title: s.name,
            subtitle: s.slug,
            href: `/species/${s.id}`,
          })} />
        </div>
      )}
    </div>
  )
}
