import prisma from '@/lib/prisma'
import { AdminLayout } from '@/components/layout/AdminLayout'
import DedupeList from './DedupeList'

export const metadata = { title: 'Dedupe Games | Admin' }

export default async function DedupePage() {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      coverUrl: true,
      platforms: { select: { platform: { select: { name: true } } } },
      genres: { select: { name: true } },
    },
    orderBy: { title: 'asc' }
  })

  // Normalize title heuristically: lowercase, remove non-alphanumeric except spaces, trim
  const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

  const groups = new Map<string, typeof games>()
  for (const game of games) {
    const norm = normalize(game.title)
    if (!groups.has(norm)) groups.set(norm, [])
    groups.get(norm)!.push(game)
  }

  const duplicates = Array.from(groups.values()).filter(g => g.length > 1)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-brand-cyan mb-2">Dedupe Games</h1>
        <p className="text-zinc-400">
          Found {duplicates.length} potential duplicate groups out of {games.length} total games.
          Merging will move all genres, platforms, and mechanics to the selected canonical game, and delete the rest.
        </p>
      </div>

      <DedupeList groups={duplicates} />
    </AdminLayout>
  )
}
