import type { Role, PlantStatus, Disposition, SeedStage, PollinationMethod } from "@/generated/prisma/client"

export type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }

export type Breadcrumb = { label: string; href?: string }

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  children?: NavItem[]
}

export interface DashboardStat {
  label: string
  value: number | string
  change?: number
  icon: string
}

export type SpeciesConfig = {
  id: string
  name: string
  colorSystem: Record<string, string>
  flowerFormOptions: string[]
  generationLabels: string[]
  breedingTerminology: Record<string, string>
}

export type { Role, PlantStatus, Disposition, SeedStage, PollinationMethod }
