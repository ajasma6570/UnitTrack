import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting to seed the database...')

  // Clear existing data
  await prisma.solarEntry.deleteMany()
  console.log('✓ Cleared existing entries')

  // Generate dummy data for the last 30 days
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const dummyEntries = []

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate realistic solar data
    const baseGeneration = 15 + Math.random() * 20 // 15-35 kWh
    const generation = parseFloat(baseGeneration.toFixed(2))

    const baseImport = 5 + Math.random() * 8 // 5-13 kWh
    const importGrid = parseFloat(baseImport.toFixed(2))

    const baseExport = 5 + Math.random() * 12 // 5-17 kWh
    const exportGrid = parseFloat(baseExport.toFixed(2))

    const unitUsed = parseFloat((generation + importGrid - exportGrid).toFixed(2))

    dummyEntries.push({
      date,
      totalGeneration: generation,
      importGrid,
      exportGrid,
      unitUsed,
    })
  }

  // Create entries
  for (const entry of dummyEntries) {
    await prisma.solarEntry.create({
      data: entry,
    })
  }

  console.log(`✓ Created ${dummyEntries.length} dummy entries`)
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
