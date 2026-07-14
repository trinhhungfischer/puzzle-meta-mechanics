import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const liveops = await prisma.mechanic.findMany({
    where: { group: { name: 'LiveOps' } }
  })
  console.log(liveops.map(m => m.name).join('\n'))
}

main().finally(() => prisma.$disconnect())
