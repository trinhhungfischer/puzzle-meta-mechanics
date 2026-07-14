/**
 * Apply a game→mechanic classification to the DB.
 *
 * Input JSON shape: { "<game-slug>": [ ["<MECH-CODE>", "core|secondary|twist", "note?"], ... ] }
 * where MECH-CODE is the prefix of a mechanic name (e.g. "MAN-101").
 *
 * Usage: npx tsx scripts/apply-classification.ts <path-to-json>
 */
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const path = process.argv[2]
  if (!path) throw new Error('Usage: apply-classification.ts <json>')
  const data: Record<string, [string, string, string?][]> = JSON.parse(fs.readFileSync(path, 'utf8'))

  // code -> mechanicId (code is the part of the name before ":")
  const mechanics = await prisma.mechanic.findMany({ select: { id: true, name: true } })
  const byCode = new Map<string, string>()
  for (const m of mechanics) {
    const code = m.name.split(':')[0].trim()
    byCode.set(code, m.id)
  }

  let games = 0, links = 0
  const missingCodes = new Set<string>()
  const missingGames: string[] = []

  for (const [slug, entries] of Object.entries(data)) {
    const game = await prisma.game.findUnique({ where: { slug }, select: { id: true } })
    if (!game) { missingGames.push(slug); continue }
    games++
    for (const [code, role, note] of entries) {
      const mechanicId = byCode.get(code)
      if (!mechanicId) { missingCodes.add(code); continue }
      await prisma.gameMechanic.upsert({
        where: { gameId_mechanicId: { gameId: game.id, mechanicId } },
        update: { role, note: note ?? null },
        create: { gameId: game.id, mechanicId, role, note: note ?? null },
      })
      links++
    }
  }

  console.log(`Applied ${links} mechanic links across ${games} games.`)
  if (missingGames.length) console.log('Unknown game slugs:', missingGames.join(', '))
  if (missingCodes.size) console.log('Unknown mechanic codes:', [...missingCodes].join(', '))
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
