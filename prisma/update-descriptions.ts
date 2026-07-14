import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const updates = [
  { name: 'Board Interaction', desc: 'Mechanics dictating how a player physically interfaces with the puzzle space.' },
  { name: 'Manipulation', desc: 'Mechanics governing the spatial or logical alteration of existing entities.' },
  { name: 'Generation', desc: 'Systems responsible for instantiating new objects into the possibility space.' },
  { name: 'Destruction', desc: 'Systems that remove entities from the active simulation layer.' },
  { name: 'Transformation', desc: 'Mechanics that degrade, upgrade, or mutate the state of a persistent object.' },
  { name: 'Constraints', desc: 'Arbitrary limitations placed on player agency or simulation physics.' },
  { name: 'Goals', desc: 'The computational criteria required to trigger a success state.' },
  { name: 'Failure', desc: 'The criteria required to trigger a definitive loss of progress.' },
  { name: 'Economy', desc: 'Systems managing the inflow and outflow of abstract resources.' },
  { name: 'LiveOps', desc: 'Time-gated algorithms designed to alter the core loop temporarily.' },
  { name: 'UX / Information', desc: 'Systems controlling how simulation data is communicated to the human operator.' }
]

async function main() {
  for (const u of updates) {
    try {
      await prisma.mechanicGroup.updateMany({
        where: { name: u.name },
        data: { description: u.desc }
      })
      console.log('Updated: ' + u.name)
    } catch (e: any) {
      console.log('Failed to update: ' + u.name + ' - ' + e.message)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
