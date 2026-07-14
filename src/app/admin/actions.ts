'use server'

import prisma from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { slugify } from '@/utils/slugify'

// --- Genres ---
export async function createGenre(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  if (!name) return

  await prisma.genre.create({
    data: { name, slug: slugify(name), description },
  })
  revalidatePath('/admin/genres')
  revalidateTag('taxonomy', 'max')
}

export async function updateGenre(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  if (!name) return

  await prisma.genre.update({
    where: { id },
    data: { name, slug: slugify(name), description },
  })
  revalidatePath('/admin/genres')
  revalidateTag('taxonomy', 'max')
}

export async function deleteGenre(id: string) {
  await prisma.genre.delete({ where: { id } })
  revalidatePath('/admin/genres')
  revalidateTag('taxonomy', 'max')
}

// --- Platforms ---
export async function createPlatform(formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return

  await prisma.platform.create({
    data: { name, slug: slugify(name) },
  })
  revalidatePath('/admin/platforms')
  revalidateTag('taxonomy', 'max')
}

export async function updatePlatform(id: string, formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return

  await prisma.platform.update({
    where: { id },
    data: { name, slug: slugify(name) },
  })
  revalidatePath('/admin/platforms')
  revalidateTag('taxonomy', 'max')
}

export async function deletePlatform(id: string) {
  await prisma.platform.delete({ where: { id } })
  revalidatePath('/admin/platforms')
  revalidateTag('taxonomy', 'max')
}

// --- Mechanic Groups ---
export async function createGroup(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  if (!name) return

  await prisma.mechanicGroup.create({
    data: { name, slug: slugify(name), description },
  })
  revalidatePath('/admin/groups')
  revalidateTag('taxonomy', 'max')
}

export async function updateGroup(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  if (!name) return

  await prisma.mechanicGroup.update({
    where: { id },
    data: { name, slug: slugify(name), description },
  })
  revalidatePath('/admin/groups')
  revalidateTag('taxonomy', 'max')
}

export async function deleteGroup(id: string) {
  await prisma.mechanicGroup.delete({ where: { id } })
  revalidatePath('/admin/groups')
  revalidateTag('taxonomy', 'max')
}

// --- Mechanics ---
export async function createMechanic(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const groupId = formData.get('groupId') as string
  
  // Parse constraints and mediaUrls from textareas (newline separated)
  const constraintsStr = formData.get('constraints') as string | null
  const mediaUrlsStr = formData.get('mediaUrls') as string | null
  
  const constraints = constraintsStr ? JSON.stringify(constraintsStr.split('\n').map(s => s.trim()).filter(Boolean)) : '[]'
  const mediaUrls = mediaUrlsStr ? JSON.stringify(mediaUrlsStr.split('\n').map(s => s.trim()).filter(Boolean)) : '[]'

  if (!name || !groupId) return

  await prisma.mechanic.create({
    data: { name, slug: slugify(name), description, groupId, constraints, mediaUrls },
  })
  revalidatePath('/admin/mechanics')
  revalidateTag('taxonomy', 'max')
}

export async function updateMechanic(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const groupId = formData.get('groupId') as string
  
  const constraintsStr = formData.get('constraints') as string | null
  const mediaUrlsStr = formData.get('mediaUrls') as string | null
  
  const constraints = constraintsStr ? JSON.stringify(constraintsStr.split('\n').map(s => s.trim()).filter(Boolean)) : '[]'
  const mediaUrls = mediaUrlsStr ? JSON.stringify(mediaUrlsStr.split('\n').map(s => s.trim()).filter(Boolean)) : '[]'

  if (!name || !groupId) return

  await prisma.mechanic.update({
    where: { id },
    data: { name, slug: slugify(name), description, groupId, constraints, mediaUrls },
  })
  revalidatePath('/admin/mechanics')
  revalidateTag('taxonomy', 'max')
}

export async function deleteMechanic(id: string) {
  await prisma.mechanic.delete({ where: { id } })
  revalidatePath('/admin/mechanics')
  revalidateTag('taxonomy', 'max')
}

// --- Games ---
export async function deleteGame(id: string) {
  await prisma.game.delete({ where: { id } })
  revalidatePath('/admin/games')
}

// Review gate: publish/unpublish a game (crawled games start as draft).
export async function setGameStatus(id: string, status: 'draft' | 'published') {
  const game = await prisma.game.update({
    where: { id },
    data: { status },
    select: { slug: true },
  })
  revalidatePath('/admin/games')
  revalidatePath('/')
  revalidatePath(`/games/${game.slug}`)
}

// Bulk review actions for the crawl queue.
export async function bulkSetGameStatus(ids: string[], status: 'draft' | 'published') {
  if (ids.length === 0) return
  await prisma.game.updateMany({ where: { id: { in: ids } }, data: { status } })
  revalidatePath('/admin/games')
  revalidatePath('/')
}

export async function bulkDeleteGames(ids: string[]) {
  if (ids.length === 0) return
  await prisma.game.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/admin/games')
  revalidatePath('/')
}

// Metric fields shared by create/update. All optional; blank inputs stay null.
type GameMetrics = {
  ratingScore: number | null;
  ratingCount: number | null;
  downloads: number | null;
  reviewCount: number | null;
  price: number | null;
  isFree: boolean;
}

type GameInput = {
  title: string;
  releaseYear: number | null;
  description: string | null;
  coverUrl: string | null;
  genres: string[]; // array of genre ids
  platforms: { platformId: string; storeUrl: string | null }[];
  mechanics: { mechanicId: string; role: string; note: string | null }[];
} & GameMetrics

export async function createGameWithRelations(data: GameInput) {
  const { title, releaseYear, description, coverUrl, genres, platforms, mechanics,
          ratingScore, ratingCount, downloads, reviewCount, price, isFree } = data
  if (!title) return

  await prisma.game.create({
    data: {
      title,
      slug: slugify(title),
      releaseYear,
      description,
      coverUrl,
      ratingScore, ratingCount, downloads, reviewCount, price, isFree,
      genres: {
        connect: genres.map(id => ({ id }))
      },
      platforms: {
        create: platforms.map(p => ({
          platformId: p.platformId,
          storeUrl: p.storeUrl
        }))
      },
      mechanics: {
        create: mechanics.map(m => ({
          mechanicId: m.mechanicId,
          role: m.role,
          note: m.note
        }))
      }
    }
  })

  revalidatePath('/admin/games')
}

export async function updateGameWithRelations(id: string, data: GameInput) {
  const { title, releaseYear, description, coverUrl, genres, platforms, mechanics,
          ratingScore, ratingCount, downloads, reviewCount, price, isFree } = data
  if (!title) return

  // To update relations, we clear existing explicit links and recreate them
  await prisma.gamePlatform.deleteMany({ where: { gameId: id } })
  await prisma.gameMechanic.deleteMany({ where: { gameId: id } })

  await prisma.game.update({
    where: { id },
    data: {
      title,
      slug: slugify(title),
      releaseYear,
      description,
      coverUrl,
      ratingScore, ratingCount, downloads, reviewCount, price, isFree,
      genres: {
        set: [], // clear existing
        connect: genres.map(gid => ({ id: gid }))
      },
      platforms: {
        create: platforms.map(p => ({
          platformId: p.platformId,
          storeUrl: p.storeUrl
        }))
      },
      mechanics: {
        create: mechanics.map(m => ({
          mechanicId: m.mechanicId,
          role: m.role,
          note: m.note
        }))
      }
    }
  })

  revalidatePath('/admin/games')
  revalidatePath(`/games/${slugify(title)}`)
}

export async function mergeDuplicateGames(canonicalId: string, duplicateIds: string[]) {
  if (duplicateIds.length === 0) return

  const duplicates = await prisma.game.findMany({
    where: { id: { in: duplicateIds } },
    include: { genres: true, platforms: true, mechanics: true }
  })

  const canonical = await prisma.game.findUnique({
    where: { id: canonicalId },
    include: { genres: true, platforms: true, mechanics: true }
  })
  if (!canonical) return

  const genreIds = new Set(canonical.genres.map(g => g.id))
  duplicates.forEach(d => d.genres.forEach(g => genreIds.add(g.id)))

  const platformIds = new Set(canonical.platforms.map(p => p.platformId))
  const newPlatforms: { platformId: string; storeUrl: string | null }[] = []
  duplicates.forEach(d => d.platforms.forEach(p => {
    if (!platformIds.has(p.platformId)) {
      platformIds.add(p.platformId)
      newPlatforms.push({ platformId: p.platformId, storeUrl: p.storeUrl })
    }
  }))

  const mechanicIds = new Set(canonical.mechanics.map(m => m.mechanicId))
  const newMechanics: { mechanicId: string; role: string; note: string | null }[] = []
  duplicates.forEach(d => d.mechanics.forEach(m => {
    if (!mechanicIds.has(m.mechanicId)) {
      mechanicIds.add(m.mechanicId)
      newMechanics.push({ mechanicId: m.mechanicId, role: m.role, note: m.note })
    }
  }))

  await prisma.game.update({
    where: { id: canonicalId },
    data: {
      genres: { connect: Array.from(genreIds).map(id => ({ id })) },
      platforms: { create: newPlatforms },
      mechanics: { create: newMechanics },
      // Update metrics if missing
      ratingScore: canonical.ratingScore ?? duplicates.find(d => d.ratingScore)?.ratingScore ?? null,
      downloads: canonical.downloads ?? duplicates.find(d => d.downloads)?.downloads ?? null,
      price: canonical.price ?? duplicates.find(d => d.price)?.price ?? null,
      coverUrl: canonical.coverUrl ?? duplicates.find(d => d.coverUrl)?.coverUrl ?? null,
      description: canonical.description ?? duplicates.find(d => d.description)?.description ?? null,
    }
  })

  await prisma.game.deleteMany({
    where: { id: { in: duplicateIds } }
  })

  revalidatePath('/admin/games')
  revalidatePath('/admin/dedupe')
}
