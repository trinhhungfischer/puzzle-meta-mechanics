import { unstable_cache } from 'next/cache'
import prisma from './prisma'

// Genres, platforms and the mechanic list change only through /admin, so they
// are cached across requests and invalidated with revalidateTag('taxonomy')
// in the admin mutations. This keeps them off the per-request critical path
// (the DB is cross-region, so each avoided round-trip is ~100-280ms).

export const getGenres = unstable_cache(
  () => prisma.genre.findMany({ orderBy: { name: 'asc' } }),
  ['taxonomy:genres'],
  // Also time-box the cache so crawler-added genres/platforms (which bypass the
  // admin mutations that call revalidateTag) show up within a few minutes.
  { tags: ['taxonomy'], revalidate: 300 },
)

export const getPlatforms = unstable_cache(
  () => prisma.platform.findMany({ orderBy: { name: 'asc' } }),
  ['taxonomy:platforms'],
  // Also time-box the cache so crawler-added genres/platforms (which bypass the
  // admin mutations that call revalidateTag) show up within a few minutes.
  { tags: ['taxonomy'], revalidate: 300 },
)

export const getMechanicsList = unstable_cache(
  () => prisma.mechanic.findMany({ orderBy: { name: 'asc' } }),
  ['taxonomy:mechanics'],
  // Also time-box the cache so crawler-added genres/platforms (which bypass the
  // admin mutations that call revalidateTag) show up within a few minutes.
  { tags: ['taxonomy'], revalidate: 300 },
)

export const getMechanicGroups = unstable_cache(
  () => prisma.mechanicGroup.findMany({ orderBy: { name: 'asc' } }),
  ['taxonomy:mechanic_groups'],
  { tags: ['taxonomy'], revalidate: 300 },
)
