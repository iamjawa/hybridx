import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding HybridX...")

  const existingSpecies = await prisma.species.findFirst()
  if (existingSpecies) {
    console.log("Database already seeded, skipping.")
    return
  }

  const rosa = await prisma.species.create({
    data: {
      name: "Rose",
      slug: "rose",
      description: "Rosa — the quintessential garden rose, bred for colour, fragrance, form, and disease resistance since antiquity.",
      flowerFormOptions: ["Single", "Semi-double", "Double", "Quartered", "Cupped", "Rosette", "Pompon"],
      generationLabels: ["F1", "F2", "F3", "F4", "F5", "BC1", "BC2"],
    },
  })

  const tea = await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Bloom Form", slug: "bloom-form", type: "TEXT", category: "Flower" },
  })
  await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Fragrance Intensity", slug: "fragrance-intensity", type: "SCALE_1_5", category: "Flower" },
  })
  await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Disease Resistance", slug: "disease-resistance", type: "SCALE_1_10", category: "Health" },
  })
  await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Petal Count", slug: "petal-count", type: "NUMERIC", category: "Flower" },
  })
  await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Bloom Size (cm)", slug: "bloom-size", type: "NUMERIC", category: "Flower" },
  })
  await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Repeat Flowering", slug: "repeat-flowering", type: "BOOLEAN", category: "Flower" },
  })
  await prisma.traitDefinition.create({
    data: { speciesId: rosa.id, name: "Growth Habit", slug: "growth-habit", type: "TEXT", category: "Plant" },
  })

  const plantData = [
    { name: "Peace", varietyName: "Madame A. Meilland", year: 1945, colour: "Yellow blend", fragrance: "Strong, fruity", diseaseResistance: "Good", repeatFlowering: true, height: 150, description: "The most famous rose of the 20th century. Large, high-centred blooms in yellow edged with pink." },
    { name: "Double Delight", varietyName: "Double Delight", year: 1977, colour: "White and red blend", fragrance: "Strong, spicy", diseaseResistance: "Moderate", repeatFlowering: true, height: 120, description: "A striking bicolour rose that develops deeper red edges as blooms age." },
    { name: "Graham Thomas", varietyName: "AUSmas", year: 1983, colour: "Rich yellow", fragrance: "Strong, tea", diseaseResistance: "Good", repeatFlowering: true, height: 120, description: "The iconic English rose with cupped, rich yellow blooms." },
    { name: "Iceberg", varietyName: "KORbin", year: 1958, colour: "White", fragrance: "Light, sweet", diseaseResistance: "Excellent", repeatFlowering: true, height: 90, description: "A prolific floribunda rose that produces clusters of pure white blooms." },
    { name: "Mister Lincoln", varietyName: "Mister Lincoln", year: 1964, colour: "Deep red", fragrance: "Strong, damask", diseaseResistance: "Moderate", repeatFlowering: false, height: 180, description: "A classic hybrid tea with enormous, velvety red blooms." },
  ]

  const plants = await Promise.all(
    plantData.map((p) =>
      prisma.plant.create({
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
          isBreederLine: true,
          inventoryCount: 1,
        },
      })
    )
  )

  const crosses = [
    { seedParentIndex: 0, pollenParentIndex: 1, plannedDate: new Date("2024-05-10"), pollinationDate: new Date("2024-05-15"), method: "MANUAL" as const, notes: "Classic colour breeding: yellow × bicolour" },
    { seedParentIndex: 2, pollenParentIndex: 3, plannedDate: new Date("2024-06-01"), pollinationDate: new Date("2024-06-05"), method: "MANUAL" as const, notes: "Fragrance × disease resistance cross" },
    { seedParentIndex: 4, pollenParentIndex: 2, plannedDate: new Date("2024-06-15"), pollinationDate: new Date("2024-06-20"), method: "MANUAL" as const, notes: "Deep red × yellow for novel colour" },
  ]

  const createdCrosses = await Promise.all(
    crosses.map((c) =>
      prisma.cross.create({
        data: {
          speciesId: rosa.id,
          seedParentId: plants[c.seedParentIndex].id,
          pollenParentId: plants[c.pollenParentIndex].id,
          plannedDate: c.plannedDate,
          pollinationDate: c.pollinationDate,
          method: c.method,
          notes: c.notes,
          isSuccess: true,
          seedCount: Math.floor(Math.random() * 30) + 10,
          crossNumber: `R-${String.fromCharCode(65 + c.seedParentIndex)}${String.fromCharCode(65 + c.pollenParentIndex)}-24`,
        },
      })
    )
  )

  for (const cross of createdCrosses) {
    const count = Math.floor(Math.random() * 8) + 3
    for (let i = 0; i < count; i++) {
      const seedlingId = `R-${cross.crossNumber?.split("-")[1]}-${String.fromCharCode(65 + i)}-24`
      await prisma.seedling.create({
        data: {
          seedlingId,
          year: 2024,
          crossId: cross.id,
          speciesId: rosa.id,
          generation: "F1",
          growthNotes: "Vigorous growth, good branching.",
          flowerNotes: "First bloom at 12 weeks.",
          health: Math.floor(Math.random() * 3) + 7,
          diseaseResistance: Math.floor(Math.random() * 4) + 6,
          disposition: ["KEPT", "CULLED", "SELECTED"][Math.floor(Math.random() * 3)] as any,
          isFavourite: Math.random() > 0.8,
        },
      })
    }
  }

  const seedlingRecords = await prisma.seedling.findMany({ take: 3 })
  for (const seedling of seedlingRecords) {
    await prisma.evaluation.create({
      data: {
        seedlingId: seedling.id,
        systemName: "Initial Assessment",
        scores: {
          vigour: Math.floor(Math.random() * 3) + 7,
          flowerForm: Math.floor(Math.random() * 3) + 6,
          fragrance: Math.floor(Math.random() * 3) + 5,
          diseaseResistance: Math.floor(Math.random() * 3) + 6,
          novelty: Math.floor(Math.random() * 3) + 4,
        },
        totalScore: Math.floor(Math.random() * 15) + 28,
        notes: "Promising first-year seedling showing good characteristics.",
      },
    })
  }

  await prisma.traitValue.create({
    data: {
      traitId: tea.id,
      plantId: plants[0].id,
      value: "High-centred, double",
      date: new Date("2024-07-01"),
    },
  })

  console.log(`✅ Created: 1 species, ${plantData.length} plants, ${createdCrosses.length} crosses`)
  console.log("✅ Created: seedlings, evaluations, and trait values")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
