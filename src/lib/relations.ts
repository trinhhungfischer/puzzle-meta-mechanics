import prisma from '@/lib/prisma'

// Include shape needed to render a <GameCard>.
const gameCardInclude = {
  genres: true,
  platforms: { include: { platform: true } },
  mechanics: { include: { mechanic: true } },
} as const

/**
 * Related games (US-011): other games that share the most mechanics with the
 * given game, ranked by shared-mechanic count. Derived from GameMechanic links.
 */
export async function getRelatedGames(
  gameId: string,
  mechanicIds: string[],
  limit = 6,
) {
  if (mechanicIds.length === 0) return [] as Array<{ game: any; shared: number }>

  const links = await prisma.gameMechanic.findMany({
    where: { mechanicId: { in: mechanicIds }, gameId: { not: gameId } },
    select: { gameId: true },
  })

  const counts = new Map<string, number>()
  for (const { gameId: gid } of links) {
    counts.set(gid, (counts.get(gid) ?? 0) + 1)
  }
  if (counts.size === 0) return []

  const topIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([gid]) => gid)

  const games = await prisma.game.findMany({
    where: { id: { in: topIds } },
    relationLoadStrategy: 'join',
    include: gameCardInclude,
  })

  // Re-apply ranking (findMany does not preserve the id order).
  return games
    .map(game => ({ game, shared: counts.get(game.id) ?? 0 }))
    .sort((a, b) => b.shared - a.shared)
}

/**
 * Co-occurring mechanics (US-011): mechanics that appear in the same games as
 * the given mechanic, ranked by how many shared games they co-occur in.
 */
export async function getCoOccurringMechanics(mechanicId: string, limit = 8) {
  const usage = await prisma.gameMechanic.findMany({
    where: { mechanicId },
    select: { gameId: true },
  })
  const gameIds = usage.map(u => u.gameId)
  if (gameIds.length === 0) {
    return [] as Array<{ mechanic: any; shared: number }>
  }

  const others = await prisma.gameMechanic.findMany({
    where: { gameId: { in: gameIds }, mechanicId: { not: mechanicId } },
    include: { mechanic: true },
  })

  const counts = new Map<string, number>()
  const byId = new Map<string, any>()
  for (const link of others) {
    counts.set(link.mechanicId, (counts.get(link.mechanicId) ?? 0) + 1)
    byId.set(link.mechanicId, link.mechanic)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([mid, shared]) => ({ mechanic: byId.get(mid), shared }))
}
