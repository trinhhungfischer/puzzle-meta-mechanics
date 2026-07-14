import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getGenres, getPlatforms } from '@/lib/taxonomy'
import GameReviewTable from './GameReviewTable'

const PAGE_SIZE = 50

export default async function GamesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const str = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined)
  const status = str('status') ?? 'draft'
  const q = str('q')
  const platform = str('platform')
  const genre = str('genre')
  const page = Math.max(1, parseInt(str('page') ?? '1', 10) || 1)

  const base: any = {}
  if (q) base.title = { contains: q }
  if (platform) base.platforms = { some: { platform: { slug: platform } } }
  if (genre) base.genres = { some: { slug: genre } }
  const where = status === 'all' ? base : { ...base, status }

  const [total, draftCount, publishedCount, allCount, games, platforms, genres] = await Promise.all([
    prisma.game.count({ where }),
    prisma.game.count({ where: { ...base, status: 'draft' } }),
    prisma.game.count({ where: { ...base, status: 'published' } }),
    prisma.game.count({ where: base }),
    prisma.game.findMany({
      where,
      orderBy: [{ status: 'asc' }, { reviewCount: 'desc' }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { genres: true, platforms: { include: { platform: true } } },
    }),
    getPlatforms(),
    getGenres(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const qs = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams()
    const merged = { status, q, platform, genre, page, ...o }
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== '' && !(k === 'page' && v === 1)) p.set(k, String(v))
    }
    const s = p.toString()
    return s ? `/admin/games?${s}` : '/admin/games'
  }

  const tabs: [string, string, number][] = [
    ['draft', 'Draft', draftCount],
    ['published', 'Published', publishedCount],
    ['all', 'All', allCount],
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-black uppercase tracking-widest m-0">Review Games</h1>
        <Button href="/admin/games/new">+ Add New Game</Button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(([val, label, count]) => (
          <Link key={val} href={qs({ status: val, page: 1 })}
            className={`px-4 py-2 font-bold uppercase tracking-wider text-sm border-2 border-outline ${status === val ? 'bg-outline text-box' : 'hover:bg-outline/10'}`}>
            {label} <span className="opacity-70">({count})</span>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6 items-end" action="/admin/games">
        <input type="hidden" name="status" value={status} />
        <div>
          <label className="block text-xs font-bold uppercase mb-1 opacity-70">Search</label>
          <input type="text" name="q" defaultValue={q} placeholder="Title..." className="!mb-0" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1 opacity-70">Platform</label>
          <select name="platform" defaultValue={platform ?? ''} className="!mb-0">
            <option value="">Any</option>
            {platforms.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase mb-1 opacity-70">Genre</label>
          <select name="genre" defaultValue={genre ?? ''} className="!mb-0">
            <option value="">Any</option>
            {genres.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
          </select>
        </div>
        <button type="submit" className="px-4 py-2 font-bold uppercase tracking-wider text-sm border-2 border-blue-solid text-blue-solid hover:bg-blue-solid hover:text-box transition-colors">
          Apply
        </button>
        {(q || platform || genre) && (
          <Link href={qs({ q: '', platform: '', genre: '', page: 1 })} className="px-4 py-2 font-bold uppercase tracking-wider text-sm opacity-70 hover:opacity-100">
            Clear
          </Link>
        )}
      </form>

      <p className="text-sm font-bold opacity-70 mb-3">
        {total} game{total !== 1 && 's'} · page {page}/{totalPages}
      </p>

      <GameReviewTable games={games as any} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          {page > 1
            ? <Link href={qs({ page: page - 1 })} className="px-4 py-2 font-bold uppercase text-sm border-2 border-outline hover:bg-outline hover:text-box">← Prev</Link>
            : <span />}
          <span className="text-sm font-bold opacity-70">{page} / {totalPages}</span>
          {page < totalPages
            ? <Link href={qs({ page: page + 1 })} className="px-4 py-2 font-bold uppercase text-sm border-2 border-outline hover:bg-outline hover:text-box">Next →</Link>
            : <span />}
        </div>
      )}
    </div>
  )
}
