import { unstable_cache } from 'next/cache'
import prisma from './prisma'

// Genres, platforms and the mechanic list change only through /admin, so they
// are cached across requests and invalidated with revalidateTag('taxonomy')
// in the admin mutations. This keeps them off the per-request critical path
// (the DB is cross-region, so each avoided round-trip is ~100-280ms).

export const getGenres = unstable_cache(
  () => prisma.genre.findMany({ 
    orderBy: { name: 'asc' },
    include: { _count: { select: { games: { where: { status: 'published' } } } } }
  }),
  ['taxonomy:genres'],
  // Also time-box the cache so crawler-added genres/platforms (which bypass the
  // admin mutations that call revalidateTag) show up within a few minutes.
  { tags: ['taxonomy'], revalidate: 300 },
)

export const getPlatforms = unstable_cache(
  () => prisma.platform.findMany({ 
    orderBy: { name: 'asc' },
    include: { _count: { select: { games: { where: { game: { status: 'published' } } } } } }
  }),
  ['taxonomy:platforms'],
  // Also time-box the cache so crawler-added genres/platforms (which bypass the
  // admin mutations that call revalidateTag) show up within a few minutes.
  { tags: ['taxonomy'], revalidate: 300 },
)

export const getMechanicsList = unstable_cache(
  () => prisma.mechanic.findMany({ 
    orderBy: { name: 'asc' },
    include: { _count: { select: { games: { where: { game: { status: 'published' } } } } } }
  }),
  ['taxonomy:mechanics'],
  // Also time-box the cache so crawler-added genres/platforms (which bypass the
  // admin mutations that call revalidateTag) show up within a few minutes.
  { tags: ['taxonomy'], revalidate: 300 },
)

export const getMechanicGroups = unstable_cache(
  () => prisma.mechanicGroup.findMany({ 
    orderBy: { name: 'asc' },
    include: {
      mechanics: {
        include: { _count: { select: { games: { where: { game: { status: 'published' } } } } } }
      }
    }
  }).then(groups => groups.map(g => ({
    ...g,
    _count: { games: g.mechanics.reduce((sum, m) => sum + m._count.games, 0) }
  }))),
  ['taxonomy:mechanic_groups'],
  { tags: ['taxonomy'], revalidate: 300 },
)
