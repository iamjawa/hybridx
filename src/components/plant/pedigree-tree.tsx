"use client"

import Link from "next/link"
import { Leaf, Sprout } from "lucide-react"

function PedigreeNode({ label, href, isCurrent, subtitle }: { label: string; href?: string; isCurrent?: boolean; subtitle?: string }) {
  const content = (
    <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-colors min-w-[120px] ${
      isCurrent
        ? "border-primary bg-primary/10 shadow-sm"
        : "border-border bg-card hover:border-muted-foreground/30"
    }`}>
      <span className={`text-sm font-medium text-center ${isCurrent ? "text-primary" : ""}`}>{label}</span>
      {subtitle && <span className="text-[10px] text-muted-foreground text-center">{subtitle}</span>}
    </div>
  )
  if (href) return <Link href={href}>{content}</Link>
  return content
}

function Connector({ vertical = false }: { vertical?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`${vertical ? "w-px h-6" : "h-px flex-1"} bg-border`} />
    </div>
  )
}

function VConnector() {
  return <Connector vertical />
}

interface PedigreeTreeProps {
  plant: any
}

export function PedigreeTree({ plant }: PedigreeTreeProps) {
  const allSeedlings = [...(plant.seedlingsFrom ?? []), ...(plant.seedlingCrosses ?? [])]

  const hasGrandparents = false
  const hasParents = plant.crossesAsSeedParent?.length > 0 || plant.crossesAsPollenParent?.length > 0

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex flex-col items-center min-w-[400px]">
        {hasGrandparents && (
          <div className="flex items-center gap-8 mb-0">
            <PedigreeNode label="Grandparent" subtitle="Unknown" />
          </div>
        )}

        {hasParents && (
          <>
            {plant.crossesAsPollenParent?.[0] && (
              <>
                <div className="flex items-center gap-8">
                  <PedigreeNode
                    label={plant.crossesAsPollenParent[0].seedParent?.name ?? "?"}
                    href={`/plants/${plant.crossesAsPollenParent[0].seedParent?.id}`}
                    subtitle="Grandparent"
                  />
                </div>
                <VConnector />
              </>
            )}
            <div className="flex items-center gap-12">
              {plant.crossesAsSeedParent?.[0]?.pollenParent && (
                <div className="flex flex-col items-center">
                  <PedigreeNode
                    label={plant.crossesAsSeedParent[0].pollenParent?.name ?? "?"}
                    href={`/plants/${plant.crossesAsSeedParent[0].pollenParent?.id}`}
                    subtitle="Pollen Parent (♂)"
                  />
                </div>
              )}
              {plant.crossesAsPollenParent?.[0]?.seedParent && (
                <div className="flex flex-col items-center">
                  <PedigreeNode
                    label={plant.crossesAsPollenParent[0]?.seedParent?.name ?? "?"}
                    href={`/plants/${plant.crossesAsPollenParent[0]?.seedParent?.id}`}
                    subtitle="Seed Parent (♀)"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex items-center gap-0 my-4 w-full max-w-sm">
          <Connector />
          <div className="flex flex-col items-center shrink-0">
            <Connector vertical />
          </div>
          <Connector />
        </div>

        <PedigreeNode
          label={plant.name}
          subtitle={`${plant.species?.name ?? ""}${plant.year ? ` · ${plant.year}` : ""}`}
          isCurrent
        />

        {allSeedlings.length > 0 && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-0 mb-2">
              <Connector />
              <span className="text-xs text-muted-foreground mx-4 shrink-0">Offspring</span>
              <Connector />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {allSeedlings.slice(0, 8).map((s: any) => (
                <Link key={s.id} href={`/seedlings/${s.id}`}>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs hover:border-muted-foreground/30 transition-colors">
                    <Sprout className="size-3 text-muted-foreground" />
                    <span>{s.seedlingId}</span>
                  </div>
                </Link>
              ))}
              {allSeedlings.length > 8 && (
                <div className="flex items-center text-xs text-muted-foreground px-3 py-2">
                  +{allSeedlings.length - 8} more
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
