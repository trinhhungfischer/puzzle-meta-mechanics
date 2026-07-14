import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const uxGroup = await prisma.mechanicGroup.findFirst({
    where: { name: 'UX / Information' }
  })
  if (!uxGroup) {
    console.error('UX Group not found')
    return
  }

  const liveops = await prisma.mechanic.findMany({
    where: { group: { name: 'LiveOps' } }
  })

  for (const m of liveops) {
    if (m.name.startsWith('UX-')) {
      await prisma.mechanic.update({
        where: { id: m.id },
        data: { groupId: uxGroup.id }
      })
      console.log(`Moved ${m.name} to UX / Information`)
    }
  }
}

main().finally(() => prisma.$disconnect())
