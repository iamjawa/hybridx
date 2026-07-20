import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌹 Seeding HybridX demo: Rose Breeding Programme...\n")

  const existing = await prisma.species.findFirst()
  if (existing) {
    console.log("Clearing existing demo data...")
    await prisma.breedingGoalScore.deleteMany()
    await prisma.breedingGoal.deleteMany()
    await prisma.evaluation.deleteMany()
    await prisma.traitValue.deleteMany()
    await prisma.traitDefinition.deleteMany()
    await prisma.seedling.deleteMany()
    await prisma.seed.deleteMany()
    await prisma.pollination.deleteMany()
    await prisma.cross.deleteMany()
    await prisma.image.deleteMany()
    await prisma.note.deleteMany()
    await prisma.task.deleteMany()
    await prisma.plant.deleteMany()
    await prisma.species.deleteMany()
  }

  const rosa = await prisma.species.create({
    data: {
      name: "Rose",
      slug: "rose",
      description: "Rosa hybrida — the quintessential garden rose, bred for colour, form, fragrance, and disease resistance.",
      flowerFormOptions: ["Single", "Semi-double", "Double", "Quartered", "Cupped", "Rosette", "Pompon", "Hybrid Tea"],
      generationLabels: ["P", "F1", "F2", "F3", "F4", "BC1", "BC2"],
      pollenViability: 85,
      seedViability: 70,
    },
  })

  const traits = await Promise.all([
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Bloom Form", slug: "bloom-form", type: "TEXT", category: "Flower" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Fragrance Intensity", slug: "fragrance-intensity", type: "SCALE_1_5", category: "Flower" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Disease Resistance", slug: "disease-resistance", type: "SCALE_1_10", category: "Health" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Petal Count", slug: "petal-count", type: "NUMERIC", category: "Flower" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Bloom Size (cm)", slug: "bloom-size", type: "NUMERIC", category: "Flower" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Repeat Flowering", slug: "repeat-flowering", type: "BOOLEAN", category: "Flower" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Growth Habit", slug: "growth-habit", type: "TEXT", category: "Plant" } }),
    prisma.traitDefinition.create({ data: { speciesId: rosa.id, name: "Vigour", slug: "vigour", type: "SCALE_1_5", category: "Health" } }),
  ])

  const [formTrait, fragranceTrait, diseaseTrait, petalTrait, bloomTrait, repeatTrait, growthTrait, vigourTrait] = traits

  const plantData = [
    { name: "Peace", varietyName: "Madame A. Meilland", year: 1945, colour: "Yellow blend", fragrance: "Strong, fruity", diseaseResistance: "Good", repeatFlowering: true, description: "The most famous rose of the 20th century. Large, high-centred blooms in yellow edged with pink.", isBreederLine: true },
    { name: "Double Delight", varietyName: "Double Delight", year: 1977, colour: "White and red blend", fragrance: "Strong, spicy", diseaseResistance: "Moderate", repeatFlowering: true, description: "A striking bicolour rose that develops deeper red edges as blooms age.", isBreederLine: true },
    { name: "Graham Thomas", varietyName: "AUSmas", year: 1983, colour: "Rich yellow", fragrance: "Strong, tea", diseaseResistance: "Good", repeatFlowering: true, description: "The iconic English rose with cupped, rich yellow blooms.", isBreederLine: true },
    { name: "Iceberg", varietyName: "KORbin", year: 1958, colour: "White", fragrance: "Light, sweet", diseaseResistance: "Excellent", repeatFlowering: true, description: "A prolific floribunda rose producing clusters of pure white blooms.", isBreederLine: true },
    { name: "Mister Lincoln", varietyName: "Mister Lincoln", year: 1964, colour: "Deep red", fragrance: "Strong, damask", diseaseResistance: "Moderate", repeatFlowering: false, description: "A classic hybrid tea with enormous, velvety red blooms.", isBreederLine: true },
    { name: "Hot Chocolate", varietyName: "WEZ cocoa", year: 2002, colour: "Chocolate brown", fragrance: "Strong, clove", diseaseResistance: "Good", repeatFlowering: true, description: "Unique smoky-chocolate coloured blooms. Excellent vase life.", isBreederLine: true },
    { name: "Gemini", varietyName: "JACal reuse", year: 1999, colour: "Pink blend", fragrance: "Moderate, citrus", diseaseResistance: "Excellent", repeatFlowering: true, description: "Large, perfectly formed pink blooms on a vigorous plant.", isBreederLine: true },
    { name: "Stainless Steel", varietyName: "Silver Star", year: 1997, colour: "Lavender grey", fragrance: "Mild, tea", diseaseResistance: "Good", repeatFlowering: true, description: "Unusual metallic lavender blooms. Striking in arrangements.", isBreederLine: false },
    { name: "Crimson Glory", varietyName: "Crimson Glory", year: 1935, colour: "Deep crimson", fragrance: "Strong, classic rose", diseaseResistance: "Moderate", repeatFlowering: true, description: "One of the most fragrant roses ever bred.", isBreederLine: true },
    { name: "Julia Child", varietyName: "WEZbella", year: 2004, colour: "Butterscotch", fragrance: "Strong, licorice", diseaseResistance: "Excellent", repeatFlowering: true, description: "Butterscotch-coloured blooms with a distinctive licorice fragrance.", isBreederLine: false },
  ]

  const plants = []
  for (const p of plantData) {
    const plant = await prisma.plant.create({
      data: {
        name: p.name,
        varietyName: p.varietyName,
        speciesId: rosa.id,
        year: p.year,
        colour: p.colour,
        fragrance: p.fragrance,
        diseaseResistance: p.diseaseResistance,
        repeatFlowering: p.repeatFlowering,
        description: p.description,
        isBreederLine: p.isBreederLine,
        isSeedParent: true,
        isPollenParent: true,
        inventoryCount: 1,
        status: "ACTIVE" as any,
      },
    })
    plants.push(plant)
  }

  const crosses = [
    { seedParentIndex: 0, pollenParentIndex: 1, year: 2020, seedCount: 85, seedlingCount: 42, selectedCount: 2, crossNumber: "PD-20", isSuccess: true, notes: "Classic colour breeding: yellow × bicolour" },
    { seedParentIndex: 6, pollenParentIndex: 5, year: 2021, seedCount: 143, seedlingCount: 87, selectedCount: 3, crossNumber: "GH-21", isSuccess: true, notes: "Target: novel colour + fragrance. Gemini × Hot Chocolate. Produced exceptional seedlings." },
    { seedParentIndex: 2, pollenParentIndex: 3, year: 2021, seedCount: 62, seedlingCount: 31, selectedCount: 1, crossNumber: "GI-21", isSuccess: true, notes: "Fragrance × disease resistance cross" },
    { seedParentIndex: 8, pollenParentIndex: 6, year: 2022, seedCount: 44, seedlingCount: 18, selectedCount: 1, crossNumber: "CG-22", isSuccess: true, notes: "Deep crimson × pink for enhanced colour" },
    { seedParentIndex: 7, pollenParentIndex: 5, year: 2022, seedCount: 97, seedlingCount: 52, selectedCount: 2, crossNumber: "SH-22", isSuccess: true, notes: "Lavender × chocolate — novel colour breeding" },
    { seedParentIndex: 8, pollenParentIndex: 4, year: 2022, seedCount: 38, seedlingCount: 0, selectedCount: 0, crossNumber: "CM-22", isSuccess: false, notes: "Attempted crimson × red — low compatibility" },
    { seedParentIndex: 9, pollenParentIndex: 6, year: 2023, seedCount: 56, seedlingCount: 29, selectedCount: 1, crossNumber: "JG-23", isSuccess: true, notes: "Butterscotch × pink — aiming for warm tones" },
    { seedParentIndex: 0, pollenParentIndex: 5, year: 2023, seedCount: 71, seedlingCount: 38, selectedCount: 0, crossNumber: "PH-23", isSuccess: true, notes: "Peace × Hot Chocolate — unexpected results, all culled" },
    { seedParentIndex: 3, pollenParentIndex: 4, year: 2023, seedCount: 113, seedlingCount: 61, selectedCount: 2, crossNumber: "IM-23", isSuccess: true, notes: "White × red — aiming for striped varieties" },
    { seedParentIndex: 5, pollenParentIndex: 7, year: 2024, seedCount: 49, seedlingCount: 24, selectedCount: 0, crossNumber: "HS-24", isSuccess: true, notes: "Chocolate × lavender — too early to evaluate" },
    { seedParentIndex: 1, pollenParentIndex: 9, year: 2024, seedCount: 33, seedlingCount: 16, selectedCount: 0, crossNumber: "DJ-24", isSuccess: true, notes: "Bicolour × butterscotch — promising start" },
    { seedParentIndex: 6, pollenParentIndex: 2, year: 2024, seedCount: 92, seedlingCount: 45, selectedCount: 1, crossNumber: "GG-24", isSuccess: true, notes: "Gemini × Graham Thomas — aiming for yellow-pink blend" },
  ]

  const createdCrosses = []
  for (const c of crosses) {
    const cross = await prisma.cross.create({
      data: {
        speciesId: rosa.id,
        seedParentId: plants[c.seedParentIndex].id,
        pollenParentId: plants[c.pollenParentIndex].id,
        crossNumber: c.crossNumber,
        plannedDate: new Date(`${c.year}-05-01`),
        pollinationDate: new Date(`${c.year}-05-15`),
        method: "MANUAL" as any,
        seedCount: c.seedCount,
        isSuccess: c.isSuccess,
        notes: c.notes,
      },
    })
    createdCrosses.push(cross)

    if (c.seedCount > 0) {
      const stage = c.isSuccess ? "GERMINATED" : "FAILED"
      await prisma.seed.create({
        data: {
          crossId: cross.id,
          speciesId: rosa.id,
          batchNumber: `${c.crossNumber}-B`,
          harvestDate: new Date(`${c.year}-08-15`),
          totalCount: c.seedCount,
          viableCount: Math.round(c.seedCount * 0.7),
          germinatedCount: c.seedlingCount,
          stage: stage as any,
          successRate: c.isSuccess ? Math.round((c.seedlingCount / c.seedCount) * 100) : 0,
        },
      })
    }
  }

  const seedlingData = [
    { crossIndices: [1, 0, 1, 2], disposition: "SELECTED", health: 9, diseaseResistance: 8 },
    { crossIndices: [1, 3, 4], disposition: "SELECTED", health: 9, diseaseResistance: 9 },
    { crossIndices: [1, 2, 5], disposition: "SELECTED", health: 8, diseaseResistance: 8 },
    { crossIndices: [1, 0, 1, 3], disposition: "KEPT", health: 8, diseaseResistance: 7 },
    { crossIndices: [1, 1, 4], disposition: "KEPT", health: 7, diseaseResistance: 8 },
    { crossIndices: [1, 2, 3], disposition: "KEPT", health: 8, diseaseResistance: 6 },
    { crossIndices: [0, 0, 1], disposition: "KEPT", health: 7, diseaseResistance: 7 },
    { crossIndices: [3, 0, 2], disposition: "KEPT", health: 8, diseaseResistance: 7 },
    { crossIndices: [4, 1, 0], disposition: "KEPT", health: 7, diseaseResistance: 6 },
    { crossIndices: [6, 2, 1], disposition: "KEPT", health: 7, diseaseResistance: 7 },
    { crossIndices: [0, 3, 1], disposition: "CULLED", health: 5, diseaseResistance: 4 },
    { crossIndices: [0, 2, 3], disposition: "CULLED", health: 4, diseaseResistance: 5 },
    { crossIndices: [1, 4, 0], disposition: "CULLED", health: 6, diseaseResistance: 4 },
    { crossIndices: [2, 1, 3], disposition: "CULLED", health: 5, diseaseResistance: 5 },
    { crossIndices: [3, 2, 0], disposition: "CULLED", health: 4, diseaseResistance: 6 },
    { crossIndices: [0, 1, 2], disposition: "CULLED", health: 5, diseaseResistance: 5 },
    { crossIndices: [2, 3, 0], disposition: "CULLED", health: 6, diseaseResistance: 4 },
    { crossIndices: [4, 0, 2], disposition: "CULLED", health: 4, diseaseResistance: 5 },
    { crossIndices: [0, 4, 1], disposition: "CULLED", health: 5, diseaseResistance: 6 },
    { crossIndices: [6, 0, 2], disposition: "KEPT", health: 7, diseaseResistance: 8 },
    { crossIndices: [8, 0, 1], disposition: "SELECTED", health: 9, diseaseResistance: 7 },
    { crossIndices: [8, 1, 3], disposition: "KEPT", health: 8, diseaseResistance: 7 },
    { crossIndices: [7, 2, 1], disposition: "CULLED", health: 5, diseaseResistance: 5 },
    { crossIndices: [11, 0, 2], disposition: "KEPT", health: 7, diseaseResistance: 7 },
    { crossIndices: [9, 1, 0], disposition: "KEPT", health: 7, diseaseResistance: 6 },
    { crossIndices: [10, 0, 2], disposition: "KEPT", health: 7, diseaseResistance: 7 },
  ]

  let seedlingCounter = 0
  const allSeedlings: any[] = []
  const colours = ["Deep pink", "Pink blend", "Coral", "Warm apricot", "Soft yellow", "Creamy white", "Light lavender", "Rose pink", "Salmon", "Burgundy", "Cherry red", "Orange blend", "Peach"]

  for (const sc of seedlingData) {
    const crossIdx = sc.crossIndices[0]
    const cross = createdCrosses[crossIdx]
    if (!cross) continue

    for (let i = 0; i < 4; i++) {
      seedlingCounter++
      const sid = `${cross.crossNumber}-${String(seedlingCounter).padStart(3, "0")}`
      const year = cross.plannedDate?.getFullYear() ?? 2023
      const seedling = await prisma.seedling.create({
        data: {
          seedlingId: sid,
          year,
          crossId: cross.id,
          speciesId: rosa.id,
          generation: "F1",
          growthNotes: ["Vigorous growth with good branching.", "Compact habit, ideal for containers.", "Strong upright growth.", "Spreading habit, good ground cover."][i % 4],
          flowerNotes: `First bloom at ${10 + i * 2} weeks. ${sc.disposition === "SELECTED" ? "Exceptional form." : sc.disposition === "KEPT" ? "Good form for evaluation." : "Average form."}`,
          health: sc.health + Math.floor(Math.random() * 3) - 1,
          diseaseResistance: sc.diseaseResistance + Math.floor(Math.random() * 3) - 1,
          colour: colours[(seedlingCounter) % colours.length],
          bloomSize: 6 + Math.random() * 6,
          petalCount: Math.floor(15 + Math.random() * 30),
          repeatFlowering: Math.random() > 0.3,
          fragrance: ["Strong, sweet", "Light, fruity", "Strong, spicy", "Moderate, tea", "Mild"][i % 5],
          disposition: sc.disposition as any,
          isFavourite: sc.disposition === "SELECTED",
          isShortlisted: sc.disposition === "KEPT",
        },
      })
      allSeedlings.push(seedling)
    }
  }

  for (const seedling of allSeedlings) {
    const evalScore = Math.round((seedling.health! + seedling.diseaseResistance! + 5 + Math.random() * 3) / 3 * 10) / 10
    const scores: Record<string, number> = {
      vigour: Math.min(10, Math.max(1, Math.round(seedling.health! + Math.random() * 2 - 1))),
      flowerForm: Math.min(10, Math.max(1, Math.round(6 + Math.random() * 4))),
      fragrance: Math.min(10, Math.max(1, Math.round(4 + Math.random() * 5))),
      diseaseResistance: Math.min(10, Math.max(1, seedling.diseaseResistance!)),
      novelty: Math.min(10, Math.max(1, Math.round(5 + Math.random() * 4))),
    }

    await prisma.evaluation.create({
      data: {
        seedlingId: seedling.id,
        systemName: "Standard",
        scores: scores as any,
        totalScore: evalScore,
        date: new Date(2025, 5 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
        notes: seedling.disposition === "SELECTED" ? "Exceptional potential. Consider for backcrossing." :
               seedling.disposition === "KEPT" ? "Good characteristics. Monitor for next season." :
               "Does not meet current breeding objectives.",
      },
    })
  }

  const goals = [
    {
      name: "Orange Exhibition Rose",
      description: "A vibrant orange Hybrid Tea with exceptional form and strong fragrance.",
      criteria: [
        { traitName: "Colour", targetValue: "Orange", weight: 35, type: "TEXT", operator: "contains" },
        { traitName: "Form", targetValue: 8, weight: 30, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Fragrance", targetValue: 7, weight: 20, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Health", targetValue: 7, weight: 15, type: "SCALE_1_10", operator: "gte" },
      ],
    },
    {
      name: "Fragrant Crimson Climber",
      description: "A climbing rose with deep crimson blooms and outstanding fragrance.",
      criteria: [
        { traitName: "Colour", targetValue: "Red", weight: 25, type: "TEXT", operator: "contains" },
        { traitName: "Fragrance", targetValue: 8, weight: 35, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Disease Resistance", targetValue: 7, weight: 25, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Form", targetValue: 7, weight: 15, type: "SCALE_1_10", operator: "gte" },
      ],
    },
    {
      name: "Disease-Resistant White Garden Rose",
      description: "A low-maintenance white rose with excellent disease resistance for garden use.",
      criteria: [
        { traitName: "Colour", targetValue: "White", weight: 20, type: "TEXT", operator: "equals" },
        { traitName: "Disease Resistance", targetValue: 8, weight: 40, type: "SCALE_1_10", operator: "gte" },
        { traitName: "Repeat Flowering", targetValue: "true", weight: 25, type: "BOOLEAN", operator: "equals" },
        { traitName: "Vigour", targetValue: 4, weight: 15, type: "SCALE_1_5", operator: "gte" },
      ],
    },
  ]

  for (const g of goals) {
    await prisma.breedingGoal.create({
      data: {
        name: g.name,
        description: g.description,
        speciesId: rosa.id,
        criteria: g.criteria as any,
      },
    })
  }

  await prisma.note.create({
    data: {
      title: "Season notes",
      content: "2025 has been an exceptional season for seedling evaluations. The Gemini × Hot Chocolate cross continues to produce outstanding progeny. Focus next year on backcrossing the selected seedlings to improve fragrance.",
      plantId: plants[6].id,
      tags: ["season-notes", "breeding"],
    },
  })

  await prisma.task.create({
    data: {
      title: "Evaluate GH-21 seedlings",
      description: "Complete final evaluations for all Gemini × Hot Chocolate seedlings",
      dueDate: new Date(2025, 8, 1),
      plantId: plants[6].id,
    },
  })

  await prisma.task.create({
    data: {
      title: "Harvest SH-22 seed hips",
      description: "Check Stainless Steel × Hot Chocolate cross for mature hips",
      dueDate: new Date(2025, 8, 15),
      plantId: plants[7].id,
    },
  })

  const totalPlants = await prisma.plant.count()
  const totalCrosses = await prisma.cross.count()
  const totalSeedlings = await prisma.seedling.count()
  const totalEvaluations = await prisma.evaluation.count()

  console.log("\n📊 Demo dataset created!")
  console.log(`  🌱 ${totalPlants} plants (10 foundational + offspring)`)
  console.log(`  🔀 ${totalCrosses} crosses (${createdCrosses.filter(c => c.isSuccess).length} successful)`)
  console.log(`  🌰 ${await prisma.seed.count()} seed batches`)
  console.log(`  🌿 ${totalSeedlings} seedlings`)
  console.log(`  ⭐ ${totalEvaluations} evaluations`)
  console.log(`  🎯 ${goals.length} breeding goals`)
  console.log(`  📝 ${await prisma.note.count()} notes`)
  console.log(`  ✅ ${await prisma.task.count()} tasks`)
  console.log("\n✨ Demo ready! Visit /dashboard to explore.")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
