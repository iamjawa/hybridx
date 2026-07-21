import { z } from "zod/v4"

export const CreatePlantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  varietyName: z.string().optional(),
  speciesId: z.string().optional(),
  description: z.string().optional(),
  origin: z.string().optional(),
  year: z.number().int().min(1600).max(2100).optional(),
  colour: z.string().optional(),
  fragrance: z.string().optional(),
  diseaseResistance: z.string().optional(),
  repeatFlowering: z.boolean().optional(),
  status: z.string().optional(),
})

export const CreateCrossSchema = z.object({
  speciesId: z.string().optional(),
  seedParentId: z.string().optional(),
  pollenParentId: z.string().optional(),
  crossNumber: z.string().optional(),
  plannedDate: z.date().optional(),
  method: z.string().optional(),
  notes: z.string().optional(),
})

export const CreateSeedSchema = z.object({
  crossId: z.string().optional(),
  speciesId: z.string().optional(),
  batchNumber: z.string().optional(),
  harvestDate: z.date().optional(),
  totalCount: z.number().int().min(0).optional(),
  viableCount: z.number().int().optional(),
  storageCondition: z.string().optional(),
  notes: z.string().optional(),
})

export const CreateSeedlingSchema = z.object({
  seedlingId: z.string().min(1, "Seedling ID is required"),
  year: z.number().int().min(1900).max(2100),
  crossId: z.string().optional(),
  speciesId: z.string().optional(),
  generation: z.string().optional(),
  seedParentId: z.string().optional(),
  crossParentId: z.string().optional(),
  colour: z.string().optional(),
  fragrance: z.string().optional(),
  health: z.number().int().min(0).max(10).optional(),
  diseaseResistance: z.number().int().min(0).max(10).optional(),
  bloomSize: z.number().min(0).optional(),
  petalCount: z.number().int().optional(),
  repeatFlowering: z.boolean().optional(),
  growthNotes: z.string().optional(),
  flowerNotes: z.string().optional(),
  disposition: z.string().optional(),
})

export const CreateEvaluationSchema = z.object({
  seedlingId: z.string().min(1),
  systemName: z.string().optional(),
  criteria: z.any().optional(),
  scores: z.any().optional(),
  totalScore: z.number().optional(),
  notes: z.string().optional(),
})

export const CreateGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  description: z.string().optional(),
  speciesId: z.string().optional(),
  criteria: z.array(z.object({
    traitName: z.string(),
    targetValue: z.union([z.string(), z.number()]),
    weight: z.number(),
    type: z.string(),
    operator: z.string().optional(),
  })).optional(),
})

export const UpdatePlantSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  varietyName: z.string().optional(),
  speciesId: z.string().optional(),
  description: z.string().optional(),
  origin: z.string().optional(),
  year: z.string().optional(),
  colour: z.string().optional(),
  fragrance: z.string().optional(),
  diseaseResistance: z.string().optional(),
  repeatFlowering: z.boolean().optional(),
  status: z.string().optional(),
})

export const UpdateCrossSchema = z.object({
  speciesId: z.string().optional(),
  seedParentId: z.string().optional(),
  pollenParentId: z.string().optional(),
  crossNumber: z.string().optional(),
  method: z.string().optional(),
  notes: z.string().optional(),
  plannedDate: z.date().optional(),
  seedCount: z.number().int().optional(),
  isolation: z.string().optional(),
  weather: z.string().optional(),
})

export const UpdateSeedlingSchema = z.object({
  seedlingId: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  crossId: z.string().optional(),
  speciesId: z.string().optional(),
  generation: z.string().optional(),
  colour: z.string().optional(),
  fragrance: z.string().optional(),
  health: z.number().optional(),
  diseaseResistance: z.number().optional(),
  bloomSize: z.number().optional(),
  petalCount: z.number().int().optional(),
  repeatFlowering: z.boolean().optional(),
  growthNotes: z.string().optional(),
  flowerNotes: z.string().optional(),
  notes: z.string().optional(),
  disposition: z.string().optional(),
})

export const FeedbackSchema = z.object({
  type: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  route: z.string().optional(),
})
