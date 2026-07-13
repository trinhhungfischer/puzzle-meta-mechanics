import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/utils/slugify'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Payload must be an array of games.' }, { status: 400 })
    }

    let count = 0

    for (const gameData of data) {
      if (!gameData.title) continue

      const slug = slugify(gameData.title)
      
      // Upsert Genres
      const genreConnect = []
      if (Array.isArray(gameData.genres)) {
        for (const g of gameData.genres) {
          const gSlug = slugify(g)
          const genre = await prisma.genre.upsert({
            where: { slug: gSlug },
            update: {},
            create: { name: g, slug: gSlug }
          })
          genreConnect.push({ id: genre.id })
        }
      }

      // We will create the game first, then handle explicit relations to avoid unique constraint issues with create/connect on explicit join tables.
      // Upsert Game
      const game = await prisma.game.upsert({
        where: { slug },
        update: {
          title: gameData.title,
          releaseYear: gameData.releaseYear || null,
          description: gameData.description || null,
          coverUrl: gameData.coverUrl || null,
          genres: { set: [], connect: genreConnect } // reset and connect
        },
        create: {
          title: gameData.title,
          slug,
          releaseYear: gameData.releaseYear || null,
          description: gameData.description || null,
          coverUrl: gameData.coverUrl || null,
          genres: { connect: genreConnect }
        }
      })

      // Clean old explicit relations to replace them
      await prisma.gamePlatform.deleteMany({ where: { gameId: game.id } })
      await prisma.gameMechanic.deleteMany({ where: { gameId: game.id } })

      // Handle Platforms
      if (Array.isArray(gameData.platforms)) {
        for (const p of gameData.platforms) {
          if (!p.name) continue
          const pSlug = slugify(p.name)
          const platform = await prisma.platform.upsert({
            where: { slug: pSlug },
            update: {},
            create: { name: p.name, slug: pSlug }
          })
          await prisma.gamePlatform.create({
            data: {
              gameId: game.id,
              platformId: platform.id,
              storeUrl: p.storeUrl || null
            }
          })
        }
      }

      // Handle Mechanics
      if (Array.isArray(gameData.mechanics)) {
        for (const m of gameData.mechanics) {
          if (!m.name) continue
          const mSlug = slugify(m.name)
          // If mechanic doesn't exist, we must put it in an 'Uncategorized' group for now
          let mechanic = await prisma.mechanic.findUnique({ where: { slug: mSlug } })
          if (!mechanic) {
            const uncatGroup = await prisma.mechanicGroup.upsert({
              where: { slug: 'uncategorized' },
              update: {},
              create: { name: 'Uncategorized', slug: 'uncategorized' }
            })
            mechanic = await prisma.mechanic.create({
              data: {
                name: m.name,
                slug: mSlug,
                groupId: uncatGroup.id
              }
            })
          }

          await prisma.gameMechanic.create({
            data: {
              gameId: game.id,
              mechanicId: mechanic.id,
              role: m.role || 'core',
              note: m.note || null
            }
          })
        }
      }
      count++
    }

    return NextResponse.json({ success: true, count })
  } catch (error: any) {
    console.error('Import Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
