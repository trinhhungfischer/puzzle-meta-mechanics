import { PrismaClient } from '@prisma/client'
import { slugify } from '../src/utils/slugify'

const prisma = new PrismaClient()

async function main() {
  const groups = await prisma.mechanicGroup.findMany()
  console.log('Current groups:', groups.map(g => g.name).join(', '))

  // If there's a group like "LiveOps / UX", split it or rename it.
  const liveOpsUx = groups.find(g => g.name.toLowerCase().includes('ux') || g.name.toLowerCase().includes('liveops'))
  if (liveOpsUx) {
    if (liveOpsUx.name === 'LiveOps / UX' || liveOpsUx.name === 'LiveOps & UX') {
      console.log('Renaming', liveOpsUx.name, 'to LiveOps')
      await prisma.mechanicGroup.update({
        where: { id: liveOpsUx.id },
        data: { name: 'LiveOps', slug: slugify('LiveOps') }
      })

      // Create new UX group
      const uxGroup = await prisma.mechanicGroup.upsert({
        where: { slug: slugify('UX / Information') },
        update: {},
        create: { name: 'UX / Information', slug: slugify('UX / Information') }
      })

      console.log('Created group UX / Information')
    } else {
      console.log('Found something else:', liveOpsUx.name)
      if (liveOpsUx.name === 'LiveOps') {
        const uxGroup = await prisma.mechanicGroup.upsert({
          where: { slug: slugify('UX / Information') },
          update: {},
          create: { name: 'UX / Information', slug: slugify('UX / Information') }
        })
        console.log('Created group UX / Information')
      }
    }
  } else {
    const liveOpsGroup = await prisma.mechanicGroup.upsert({
      where: { slug: slugify('LiveOps') },
      update: {},
      create: { name: 'LiveOps', slug: slugify('LiveOps') }
    })
    const uxGroup = await prisma.mechanicGroup.upsert({
      where: { slug: slugify('UX / Information') },
      update: {},
      create: { name: 'UX / Information', slug: slugify('UX / Information') }
    })
    console.log('Created LiveOps and UX groups')
  }
}

main().finally(() => prisma.$disconnect())
