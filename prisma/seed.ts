import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Mechanics
  const sokoban = await prisma.mechanic.upsert({
    where: { name: 'Sokoban' },
    update: {},
    create: {
      name: 'Sokoban',
      description: 'Pushing blocks or crates to specific locations.',
    },
  })

  const word = await prisma.mechanic.upsert({
    where: { name: 'Word Forming' },
    update: {},
    create: {
      name: 'Word Forming',
      description: 'Forming words to trigger events or rules.',
    },
  })

  const time = await prisma.mechanic.upsert({
    where: { name: 'Time Manipulation' },
    update: {},
    create: {
      name: 'Time Manipulation',
      description: 'Rewinding, pausing, or altering the flow of time.',
    },
  })

  const portals = await prisma.mechanic.upsert({
    where: { name: 'Portals' },
    update: {},
    create: {
      name: 'Portals',
      description: 'Connecting two disjoint spaces via portals.',
    },
  })

  const lineDrawing = await prisma.mechanic.upsert({
    where: { name: 'Line Drawing' },
    update: {},
    create: {
      name: 'Line Drawing',
      description: 'Drawing paths on a grid subject to specific rules.',
    },
  })

  const perspective = await prisma.mechanic.upsert({
    where: { name: 'Perspective Shift' },
    update: {},
    create: {
      name: 'Perspective Shift',
      description: 'Changing the camera angle or perspective to reveal new paths.',
    },
  })

  // Games
  await prisma.game.create({
    data: {
      title: 'Baba Is You',
      releaseYear: 2019,
      description: 'A puzzle game where the rules are present as physical blocks you can interact with.',
      mechanics: {
        connect: [
          { id: sokoban.id },
          { id: word.id },
        ],
      },
    },
  })

  await prisma.game.create({
    data: {
      title: 'Portal',
      releaseYear: 2007,
      description: 'A puzzle-platform game that uses the portal gun to solve puzzles.',
      mechanics: {
        connect: [
          { id: portals.id },
        ],
      },
    },
  })

  await prisma.game.create({
    data: {
      title: 'Braid',
      releaseYear: 2008,
      description: 'A platform game featuring time manipulation to solve puzzles.',
      mechanics: {
        connect: [
          { id: time.id },
        ],
      },
    },
  })

  await prisma.game.create({
    data: {
      title: 'The Witness',
      releaseYear: 2016,
      description: 'Explore an island and solve line-drawing puzzles on panels.',
      mechanics: {
        connect: [
          { id: lineDrawing.id },
        ],
      },
    },
  })

  await prisma.game.create({
    data: {
      title: 'Fez',
      releaseYear: 2012,
      description: 'A 2D platformer set in a 3D world where you rotate the perspective.',
      mechanics: {
        connect: [
          { id: perspective.id },
        ],
      },
    },
  })

  await prisma.game.create({
    data: {
      title: 'Superliminal',
      releaseYear: 2019,
      description: 'A puzzle game based on forced perspective and optical illusions.',
      mechanics: {
        connect: [
          { id: perspective.id },
        ],
      },
    },
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
