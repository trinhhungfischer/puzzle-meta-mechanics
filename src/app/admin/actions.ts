'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
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
}

export async function deleteGenre(id: string) {
  await prisma.genre.delete({ where: { id } })
  revalidatePath('/admin/genres')
}

// --- Platforms ---
export async function createPlatform(formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return

  await prisma.platform.create({
    data: { name, slug: slugify(name) },
  })
  revalidatePath('/admin/platforms')
}

export async function updatePlatform(id: string, formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return

  await prisma.platform.update({
    where: { id },
    data: { name, slug: slugify(name) },
  })
  revalidatePath('/admin/platforms')
}

export async function deletePlatform(id: string) {
  await prisma.platform.delete({ where: { id } })
  revalidatePath('/admin/platforms')
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
}

export async function deleteGroup(id: string) {
  await prisma.mechanicGroup.delete({ where: { id } })
  revalidatePath('/admin/groups')
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
}

export async function deleteMechanic(id: string) {
  await prisma.mechanic.delete({ where: { id } })
  revalidatePath('/admin/mechanics')
}

// --- Games ---
export async function deleteGame(id: string) {
  await prisma.game.delete({ where: { id } })
  revalidatePath('/admin/games')
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
