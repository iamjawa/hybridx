"use server"

import { prisma } from "@/lib/prisma"

export async function exportPlantsCSV() {
  const plants = await prisma.plant.findMany({
    where: { deletedAt: null },
    include: { species: true, crossesAsSeedParent: { take: 1 }, crossesAsPollenParent: { take: 1 } },
    orderBy: { name: "asc" },
  })

  const header = "Name,Species,Variety,Year,Colour,Fragrance,Disease Resistance,Repeat Flowering,Origin,Status,Seed Parent,Pollen Parent,Created"
  const rows = plants.map((p) => {
    const seedParent = p.crossesAsSeedParent[0]?.pollenParentId ?? ""
    const pollenParent = p.crossesAsPollenParent[0]?.seedParentId ?? ""
    return [
      escapeCsv(p.name),
      p.species?.name ?? "",
      p.varietyName ?? "",
      p.year?.toString() ?? "",
      p.colour ?? "",
      p.fragrance ?? "",
      p.diseaseResistance ?? "",
      p.repeatFlowering ? "Yes" : "No",
      p.origin ?? "",
      p.status ?? "",
      seedParent,
      pollenParent,
      p.createdAt.toISOString().split("T")[0],
    ].join(",")
  })

  return `${header}\n${rows.join("\n")}`
}

export async function exportSeedlingsCSV() {
  const seedlings = await prisma.seedling.findMany({
    where: { deletedAt: null },
    include: { cross: { include: { seedParent: true, pollenParent: true } }, evaluations: { take: 1, orderBy: { date: "desc" } } },
    orderBy: { seedlingId: "asc" },
  })

  const header = "Seedling ID,Year,Cross,Seed Parent,Pollen Parent,Generation,Colour,Health,Disease Resistance,Bloom Size,Disposition,Score,Created"
  const rows = seedlings.map((s) => {
    const cross = s.cross ? `${s.cross.seedParent?.name ?? "?"} × ${s.cross.pollenParent?.name ?? "?"}` : ""
    return [
      s.seedlingId,
      s.year.toString(),
      escapeCsv(cross),
      s.cross?.seedParent?.name ?? "",
      s.cross?.pollenParent?.name ?? "",
      s.generation ?? "",
      s.colour ?? "",
      s.health?.toString() ?? "",
      s.diseaseResistance?.toString() ?? "",
      s.bloomSize?.toString() ?? "",
      s.disposition ?? "",
      s.evaluations[0]?.totalScore?.toString() ?? "",
      s.createdAt.toISOString().split("T")[0],
    ].join(",")
  })

  return `${header}\n${rows.join("\n")}`
}

export async function exportCrossesCSV() {
  const crosses = await prisma.cross.findMany({
    where: { deletedAt: null },
    include: { seedParent: true, pollenParent: true, species: true },
    orderBy: { createdAt: "desc" },
  })

  const header = "Cross Number,Seed Parent,Pollen Parent,Species,Method,Planned Date,Pollination Date,Seed Count,Is Success,Notes,Created"
  const rows = crosses.map((c) => [
    c.crossNumber ?? "",
    c.seedParent?.name ?? "",
    c.pollenParent?.name ?? "",
    c.species?.name ?? "",
    c.method,
    c.plannedDate?.toISOString().split("T")[0] ?? "",
    c.pollinationDate?.toISOString().split("T")[0] ?? "",
    c.seedCount?.toString() ?? "",
    c.isSuccess ? "Yes" : "No",
    escapeCsv(c.notes ?? ""),
    c.createdAt.toISOString().split("T")[0],
  ].join(","))

  return `${header}\n${rows.join("\n")}`
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
