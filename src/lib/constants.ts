export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Plants", href: "/plants", icon: "Leaf" },
  { label: "Crosses", href: "/crosses", icon: "GitMerge" },
  { label: "Seedlings", href: "/seedlings", icon: "Sprout" },
  { label: "Species", href: "/species", icon: "Flower2" },
  { label: "Evaluation", href: "/evaluation", icon: "Star" },
] as const

export const SPECIES_DEFAULTS = {
  generationLabels: ["F1", "F2", "F3", "F4", "F5", "BC1", "BC2"],
  breedingTerminology: {
    cross: "Cross",
    seedling: "Seedling",
    generation: "Generation",
    parent: "Parent",
    variety: "Variety",
  },
}

export const DISPOSITION_COLORS: Record<string, string> = {
  SELECTED: "text-emerald-500",
  KEPT: "text-blue-500",
  CULLED: "text-red-500",
  SOLD: "text-amber-500",
  GIFTED: "text-purple-500",
  DEAD: "text-neutral-500",
}

export const SEED_STAGE_LABELS: Record<string, string> = {
  HARVESTED: "Harvested",
  CLEANED: "Cleaned",
  STORED: "Stored",
  STRATIFYING: "Stratifying",
  COLD_STRATIFYING: "Cold Stratifying",
  WARM_STRATIFYING: "Warm Stratifying",
  GERMINATING: "Germinating",
  GERMINATED: "Germinated",
  FAILED: "Failed",
}
