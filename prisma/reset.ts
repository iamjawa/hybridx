import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function reset() {
  await prisma.evaluation.deleteMany()
  await prisma.traitValue.deleteMany()
  await prisma.seedling.deleteMany()
  await prisma.pollination.deleteMany()
  await prisma.seed.deleteMany()
  await prisma.cross.deleteMany()
  await prisma.plant.deleteMany()
  await prisma.traitDefinition.deleteMany()
  await prisma.species.deleteMany()
  console.log("Reset complete")
}

reset().catch(console.error).finally(() => prisma.$disconnect())
