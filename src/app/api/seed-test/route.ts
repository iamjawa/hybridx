import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const USER_ID = "3a7c23da-a11b-4249-a2a5-fb42170e4d0a"
  const results: string[] = []

  try {
    await prisma.user.upsert({ where: { id: USER_ID }, update: {}, create: { id: USER_ID, email: "billyburrows402@gmail.com", name: "Dev Test" } })
    results.push("User synced")

    let [hybridTea] = await prisma.species.findMany({ where: { name: "Hybrid Tea Rose" } })
    let [floribunda] = await prisma.species.findMany({ where: { name: "Floribunda Rose" } })
    if (!hybridTea) hybridTea = await prisma.species.create({ data: { name: "Hybrid Tea Rose", slug: "hybrid-tea-rose", createdById: USER_ID } })
    if (!floribunda) floribunda = await prisma.species.create({ data: { name: "Floribunda Rose", slug: "floribunda-rose", createdById: USER_ID } })
    results.push("Species ready")

    const existingTraits = await prisma.traitDefinition.findMany({ where: { speciesId: hybridTea.id } })
    if (existingTraits.length === 0) {
      await prisma.traitDefinition.createMany({ data: [
        { speciesId: hybridTea.id, name: "Flower Colour", slug: "flower-colour", type: "TEXT", sortOrder: 1 },
        { speciesId: hybridTea.id, name: "Bloom Size", slug: "bloom-size", type: "SCALE_1_10", sortOrder: 2 },
        { speciesId: hybridTea.id, name: "Fragrance", slug: "fragrance", type: "SCALE_1_5", sortOrder: 3 },
        { speciesId: hybridTea.id, name: "Repeat Flowering", slug: "repeat-flowering", type: "BOOLEAN", sortOrder: 4 },
        { speciesId: hybridTea.id, name: "Disease Resistance", slug: "disease-resistance", type: "SCALE_1_5", sortOrder: 5 },
        { speciesId: hybridTea.id, name: "Petal Count", slug: "petal-count", type: "NUMERIC", sortOrder: 6 },
        { speciesId: hybridTea.id, name: "Bloom Share", slug: "bloom-share", type: "PERCENTAGE", sortOrder: 7 },
        { speciesId: hybridTea.id, name: "Good for Cutting", slug: "good-for-cutting", type: "YES_NO", sortOrder: 8 },
      ]})
      results.push("8 traits created")
    }

    const existingPlants = await prisma.plant.findMany({ where: { breederId: USER_ID }, orderBy: { createdAt: "asc" } })
    let p1, p2, p3
    if (existingPlants.length === 0) {
      p1 = await prisma.plant.create({ data: { name: "Peace Rose", speciesId: hybridTea.id, breederId: USER_ID, year: 1945, colour: "Yellow-Pink", status: "ACTIVE", isBreederLine: true, pollenFertility: 85, seedFertility: 70, inventoryCount: 3, description: "Famous rose, yellow blooms with pink edges" } })
      p2 = await prisma.plant.create({ data: { name: "Queen Elizabeth", speciesId: hybridTea.id, breederId: USER_ID, year: 1954, colour: "Clear pink", status: "ACTIVE", isBreederLine: true, pollenFertility: 90, seedFertility: 80, inventoryCount: 5, description: "Grandiflora with clear pink blooms" } })
      p3 = await prisma.plant.create({ data: { name: "Iceberg", speciesId: floribunda.id, breederId: USER_ID, year: 1958, colour: "White", status: "DORMANT", inventoryCount: 2 } })
      results.push("3 plants created")
    } else { p1 = existingPlants[0]; p2 = existingPlants[1]; p3 = existingPlants[2]; results.push(`${existingPlants.length} plants exist`) }

    const existingCrosses = await prisma.cross.findMany({ where: { createdById: USER_ID } })
    let cross
    if (existingCrosses.length === 0 && p1 && p2) {
      cross = await prisma.cross.create({ data: { crossNumber: "HT-2024-001", speciesId: hybridTea.id, seedParentId: p1.id, pollenParentId: p2.id, createdById: USER_ID, method: "MANUAL", plannedDate: new Date("2024-05-15"), notes: "Aiming for large fragrant blooms" } })
      results.push("1 cross created")
    } else { cross = existingCrosses[0]; results.push(`${existingCrosses.length} crosses exist`) }

    const existingSeeds = await prisma.seed.findMany({ where: cross ? { crossId: cross.id } : {} })
    if (existingSeeds.length === 0 && cross) {
      await prisma.seed.create({ data: { crossId: cross.id, speciesId: hybridTea.id, batchNumber: "HT-2024-S-001", stage: "STRATIFYING", totalCount: 45, viableCount: 38, harvestDate: new Date("2024-08-15"), stratificationStart: new Date("2024-11-01"), coldStratDays: 30, notes: "Cold strat Nov 2024" } })
      await prisma.seed.create({ data: { speciesId: floribunda.id, batchNumber: "FB-2024-S-001", stage: "GERMINATED", totalCount: 20, viableCount: 18, germinatedCount: 15, harvestDate: new Date("2024-07-20"), germinationDate: new Date("2024-09-15") } })
      results.push("2 seed batches created")
    } else { results.push(`${existingSeeds.length} seeds exist`) }

    const existingSeedlings = await prisma.seedling.findMany({ where: { createdById: USER_ID } })
    if (existingSeedlings.length === 0 && cross) {
      for (let i = 1; i <= 3; i++) {
        await prisma.seedling.create({ data: { seedlingId: `HT-2024-S-${String(i).padStart(3,"0")}`, year: 2024, crossId: cross.id, speciesId: hybridTea.id, generation: "F1", colour: i === 1 ? "Light pink" : i === 2 ? "Deep pink" : "White", fragrance: "Sweet", health: 8, diseaseResistance: 7, disposition: i === 1 ? "SELECTED" : i === 2 ? "KEPT" : undefined, createdById: USER_ID } })
      }
      results.push("3 seedlings created")
    } else { results.push(`${existingSeedlings.length} seedlings exist`) }

    const existingGoals = await prisma.breedingGoal.findMany({ where: { createdById: USER_ID } })
    if (existingGoals.length === 0) {
      await prisma.breedingGoal.create({ data: { name: "Fragrant Pink Hybrid Tea", description: "Disease-resistant HT with large pink blooms and strong fragrance", speciesId: hybridTea.id, createdById: USER_ID, criteria: [{ traitName: "Fragrance", targetValue: 5, weight: 30, type: "SCALE_1_5" }, { traitName: "Repeat Flowering", targetValue: "true", weight: 25, type: "BOOLEAN", operator: "equals" }, { traitName: "Flower Colour", targetValue: "pink", weight: 20, type: "TEXT", operator: "contains" }, { traitName: "Bloom Size", targetValue: 8, weight: 25, type: "SCALE_1_10" }] } })
      results.push("1 goal created (with BOOLEAN criterion)")
    } else { results.push(`${existingGoals.length} goals exist`) }

    if (p1) {
      const existingTVs = await prisma.traitValue.findMany({ where: { plantId: p1.id } })
      if (existingTVs.length === 0) {
        const traits = await prisma.traitDefinition.findMany({ where: { speciesId: hybridTea.id } })
        for (const t of traits) {
          let v; switch (t.type) { case "TEXT": v = "Yellow-Pink"; break; case "SCALE_1_10": v = 8; break; case "SCALE_1_5": v = 4; break; case "BOOLEAN": v = true; break; case "NUMERIC": v = 55; break; case "PERCENTAGE": v = 85; break; case "YES_NO": v = "Yes"; break; }
          await prisma.traitValue.create({ data: { traitId: t.id, plantId: p1.id, value: v } })
        }
        results.push(`Trait values for Peace Rose`)
      }
    }

    const seedlingCount = await prisma.seedling.count({ where: { createdById: USER_ID }, orderBy: { seedlingId: "asc" } })
    const seedlings = await prisma.seedling.findMany({ where: { createdById: USER_ID }, orderBy: { seedlingId: "asc" }, take: 1 })
    if (seedlings.length > 0) {
      const existingEvals = await prisma.evaluation.count({ where: { seedlingId: seedlings[0].id } })
      if (existingEvals === 0) {
        await prisma.evaluation.create({ data: { seedlingId: seedlings[0].id, evaluatorId: USER_ID, systemName: "Standard", scores: { vigour: 8, flowerForm: 9, fragrance: 7, diseaseResistance: 8, novelty: 6 }, totalScore: 7.6, notes: "Promising seedling" } })
        results.push("1 evaluation created")
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
