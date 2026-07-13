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

export async function deleteGroup(id: string) {
  await prisma.mechanicGroup.delete({ where: { id } })
  revalidatePath('/admin/groups')
}

// --- Mechanics ---
export async function createMechanic(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const groupId = formData.get('groupId') as string
  if (!name || !groupId) return

  await prisma.mechanic.create({
    data: { name, slug: slugify(name), description, groupId },
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
