'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- Mechanics ---
export async function createMechanic(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  if (!name) return

  await prisma.mechanic.create({
    data: { name, description },
  })
  revalidatePath('/mechanics')
}

export async function deleteMechanic(id: string) {
  await prisma.mechanic.delete({ where: { id } })
  revalidatePath('/mechanics')
}

// --- Games ---
export async function createGame(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const releaseYearStr = formData.get('releaseYear') as string | null
  const coverUrl = formData.get('coverUrl') as string | null
  const mechanicIds = formData.getAll('mechanics') as string[]

  const releaseYear = releaseYearStr ? parseInt(releaseYearStr) : null

  if (!title) return

  await prisma.game.create({
    data: {
      title,
      description,
      releaseYear,
      coverUrl,
      mechanics: {
        connect: mechanicIds.map(id => ({ id })),
      },
    },
  })
  revalidatePath('/games')
  revalidatePath('/')
}

export async function deleteGame(id: string) {
  await prisma.game.delete({ where: { id } })
  revalidatePath('/games')
}
