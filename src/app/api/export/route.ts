import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        genres: { select: { name: true } },
        platforms: {
          include: { platform: { select: { name: true } } }
        },
        mechanics: {
          include: { mechanic: { select: { name: true } } }
        }
      }
    })

    const payload = games.map(g => ({
      title: g.title,
      slug: g.slug,
      releaseYear: g.releaseYear,
      releaseDate: g.releaseDate,
      description: g.description,
      coverUrl: g.coverUrl,
      status: g.status,
      ratingScore: g.ratingScore,
      ratingCount: g.ratingCount,
      downloads: g.downloads,
      reviewCount: g.reviewCount,
      price: g.price,
      isFree: g.isFree,
      genres: g.genres.map(gn => gn.name),
      platforms: g.platforms.map(p => ({
        name: p.platform.name,
        storeUrl: p.storeUrl,
        ratingScore: p.ratingScore,
        reviewCount: p.reviewCount,
        downloads: p.downloads,
        price: p.price,
        isFree: p.isFree,
      })),
      mechanics: g.mechanics.map(m => ({
        name: m.mechanic.name,
        role: m.role,
        note: m.note
      }))
    }))

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Disposition': 'attachment; filename="games_export.json"',
        'Content-Type': 'application/json'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
