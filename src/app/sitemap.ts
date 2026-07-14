import type { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://puzzle-meta-mechanic.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, mechanics, genres] = await Promise.all([
    prisma.game.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.mechanic.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.genre.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ])

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/mechanics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  games.forEach(game => {
    sitemapEntries.push({
      url: `${BASE_URL}/games/${game.slug}`,
      lastModified: game.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  mechanics.forEach(mechanic => {
    sitemapEntries.push({
      url: `${BASE_URL}/mechanics/${mechanic.slug}`,
      lastModified: mechanic.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  genres.forEach(genre => {
    sitemapEntries.push({
      url: `${BASE_URL}/genres/${genre.slug}`,
      lastModified: genre.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  })

  return sitemapEntries
}
