"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/lib/types"
import { trackEvent, EVENTS } from "@/lib/tracking"
import { requireUserId } from "@/lib/require-user"

type ImportRow = Record<string, string>

type ColumnMap = {
  name?: string
  species?: string
  varietyName?: string
  year?: string
  colour?: string
  fragrance?: string
  diseaseResistance?: string
  repeatFlowering?: string
  origin?: string
  description?: string
  status?: string
  seedParent?: string
  pollenParent?: string
  generation?: string
  location?: string
}

export async function parseCSV(csvText: string): Promise<ActionResult<{ headers: string[]; rows: ImportRow[]; rowCount: number }>> {
  try {
    const lines = csvText.trim().split("\n")
    if (lines.length < 2) return { success: false, error: "CSV must have a header row and at least one data row" }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    const rows = lines.slice(1).filter((l) => l.trim()).map((line) => {
      const values = parseCSVLine(line)
      const row: ImportRow = {}
      headers.forEach((h, i) => { row[h] = values[i] ?? "" })
      return row
    })

    const MAX_ROWS = 1000
    if (rows.length > MAX_ROWS) return { success: false, error: `Maximum ${MAX_ROWS} rows supported. Found ${rows.length}.` }

    return { success: true, data: { headers, rows: rows.slice(0, MAX_ROWS), rowCount: rows.length } }
  } catch (error) {
    return { success: false, error: "Failed to parse CSV file. Check the format and try again." }
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""))
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""))
  return result
}

export async function validateImport(rows: ImportRow[], columnMap: ColumnMap): Promise<ActionResult<{
  valid: number
  warnings: { row: number; message: string }[]
  errors: { row: number; message: string }[]
  speciesFound: string[]
}>> {
  try {
    const errors: { row: number; message: string }[] = []
    const warnings: { row: number; message: string }[] = []
    const speciesNames = new Set<string>()

    if (!columnMap.name) return { success: false, error: "Plant name column is required" }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      if (!row[columnMap.name]?.trim()) {
        errors.push({ row: rowNum, message: "Plant name is required" })
      }

      if (columnMap.species && row[columnMap.species]?.trim()) {
        speciesNames.add(row[columnMap.species].trim())
      }

      if (columnMap.year && row[columnMap.year]?.trim()) {
        const year = parseInt(row[columnMap.year])
        if (isNaN(year) || year < 1000 || year > 2100) {
          warnings.push({ row: rowNum, message: `Invalid year "${row[columnMap.year]}"` })
        }
      }
    }

    const existingPlants = await prisma.plant.findMany({
      where: { name: { in: rows.map((r) => r[columnMap.name!]).filter(Boolean) } },
      select: { name: true },
    })
    const existingNames = new Set(existingPlants.map((p) => p.name.toLowerCase()))

    const existingSpecies = await prisma.species.findMany({
      where: { name: { in: Array.from(speciesNames) } },
      select: { name: true, id: true },
    })
    const speciesMap = new Map(existingSpecies.map((s) => [s.name.toLowerCase(), s.id]))

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const name = row[columnMap.name!]?.trim()
      if (name && existingNames.has(name.toLowerCase())) {
        warnings.push({ row: i + 2, message: `"${name}" already exists and will be skipped` })
      }
      if (columnMap.species && row[columnMap.species]?.trim()) {
        const sn = row[columnMap.species].trim().toLowerCase()
        if (!speciesMap.has(sn)) {
          warnings.push({ row: i + 2, message: `Species "${row[columnMap.species]}" not found. It will be created.` })
        }
      }
      if (columnMap.seedParent && row[columnMap.seedParent]?.trim()) {
        if (!existingNames.has(row[columnMap.seedParent].trim().toLowerCase())) {
          warnings.push({ row: i + 2, message: `Seed parent "${row[columnMap.seedParent]}" not found` })
        }
      }
    }

    return {
      success: true,
      data: {
        valid: rows.length - errors.length,
        warnings,
        errors,
        speciesFound: Array.from(speciesNames),
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to validate data" }
  }
}

export async function importPlants(rows: ImportRow[], columnMap: ColumnMap): Promise<ActionResult<{
  created: number
  skipped: number
  errors: number
  details: string[]
}>> {
  try {
    const userId = await requireUserId()
    let created = 0
    let skipped = 0
    let errors = 0
    const details: string[] = []

    const existingPlants = await prisma.plant.findMany({ select: { name: true } })
    const existingNames = new Set(existingPlants.map((p) => p.name.toLowerCase()))

    const existingSpecies = await prisma.species.findMany({ select: { name: true, id: true } })
    const speciesByName = new Map(existingSpecies.map((s) => [s.name.toLowerCase(), s.id]))

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const name = row[columnMap.name!]?.trim()
        if (!name) { errors++; details.push(`Row ${i + 2}: Missing name`); continue }
        if (existingNames.has(name.toLowerCase())) { skipped++; details.push(`Row ${i + 2}: "${name}" skipped (duplicate)`); continue }

        let speciesId: string | undefined
        if (columnMap.species && row[columnMap.species]?.trim()) {
          const sn = row[columnMap.species].trim().toLowerCase()
          if (speciesByName.has(sn)) {
            speciesId = speciesByName.get(sn)
          } else {
            const newSpecies = await prisma.species.create({
              data: { name: row[columnMap.species].trim(), slug: sn.replace(/\s+/g, "-"), createdById: userId },
            })
            speciesByName.set(sn, newSpecies.id)
            speciesId = newSpecies.id
            details.push(`Row ${i + 2}: Created species "${row[columnMap.species].trim()}"`)
          }
        }

        let year: number | undefined
        if (columnMap.year && row[columnMap.year]?.trim()) {
          year = parseInt(row[columnMap.year])
          if (isNaN(year)) year = undefined
        }

        let repeatFlowering: boolean | undefined
        if (columnMap.repeatFlowering && row[columnMap.repeatFlowering]?.trim()) {
          const v = row[columnMap.repeatFlowering].trim().toLowerCase()
          repeatFlowering = v === "yes" || v === "true" || v === "1"
        }

        await prisma.plant.create({
          data: {
            name,
            breederId: userId,
            speciesId,
            varietyName: columnMap.varietyName ? row[columnMap.varietyName]?.trim() || undefined : undefined,
            year,
            colour: columnMap.colour ? row[columnMap.colour]?.trim() || undefined : undefined,
            fragrance: columnMap.fragrance ? row[columnMap.fragrance]?.trim() || undefined : undefined,
            diseaseResistance: columnMap.diseaseResistance ? row[columnMap.diseaseResistance]?.trim() || undefined : undefined,
            repeatFlowering,
            origin: columnMap.origin ? row[columnMap.origin]?.trim() || undefined : undefined,
            description: columnMap.description ? row[columnMap.description]?.trim() || undefined : undefined,
            status: columnMap.status ? (row[columnMap.status]?.trim() as any) || undefined : undefined,
          },
        })

        created++
        existingNames.add(name.toLowerCase())
      } catch (e) {
        errors++
        details.push(`Row ${i + 2}: Error — ${(e as Error).message}`)
      }
    }

    trackEvent(EVENTS.CSV_IMPORT_COMPLETED, { created, skipped, errors })
    revalidatePath("/plants")
    return { success: true, data: { created, skipped, errors, details } }
  } catch (error) {
    return { success: false, error: "Import failed" }
  }
}
