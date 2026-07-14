'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pill } from '@/components/ui/Pill'
import { bulkSetGameStatus, bulkDeleteGames } from '../actions'

type Row = {
  id: string
  title: string
  slug: string
  status: string
  coverUrl: string | null
  ratingScore: number | null
  reviewCount: number | null
  downloads: number | null
  genres: { id: string; name: string }[]
  platforms: { id: string; platform: { name: string } }[]
}

export default function GameReviewTable({ games }: { games: Row[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  const allOnPage = games.length > 0 && games.every(g => selected.has(g.id))
  const ids = [...selected]

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected(allOnPage ? new Set() : new Set(games.map(g => g.id)))

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn()
      setSelected(new Set())
      router.refresh()
    })

  const publish = () => run(() => bulkSetGameStatus(ids, 'published'))
  const unpublish = () => run(() => bulkSetGameStatus(ids, 'draft'))
  const remove = () => {
    if (confirm(`Delete ${ids.length} game(s)? This cannot be undone.`)) {
      run(() => bulkDeleteGames(ids))
    }
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 mb-4 p-3 bg-box border-2 border-outline">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-sm uppercase tracking-wider">
          <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="w-4 h-4 accent-brand-violet" />
          Select page
        </label>
        <span className="text-sm font-bold opacity-70">{selected.size} selected</span>
        <div className="flex gap-2 ml-auto">
          <button onClick={publish} disabled={pending || selected.size === 0}
            className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider border-2 border-green-solid text-green-solid disabled:opacity-40 hover:bg-green-solid hover:text-box transition-colors">
            Publish
          </button>
          <button onClick={unpublish} disabled={pending || selected.size === 0}
            className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider border-2 border-outline disabled:opacity-40 hover:bg-outline hover:text-box transition-colors">
            Unpublish
          </button>
          <button onClick={remove} disabled={pending || selected.size === 0}
            className="px-3 py-1.5 text-sm font-bold uppercase tracking-wider border-2 border-red-600 text-red-600 disabled:opacity-40 hover:bg-red-600 hover:text-white transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {games.map(g => {
          const isSel = selected.has(g.id)
          return (
            <div key={g.id}
              className={`flex items-center gap-3 p-2 border-2 ${isSel ? 'border-brand-violet bg-brand-violet/5' : 'border-outline'}`}>
              <input type="checkbox" checked={isSel} onChange={() => toggle(g.id)} className="w-4 h-4 accent-brand-violet flex-shrink-0" />
              {g.coverUrl
                ? <img src={g.coverUrl} alt="" className="w-12 h-12 object-cover flex-shrink-0 border border-outline" />
                : <div className="w-12 h-12 flex-shrink-0 bg-box border border-outline flex items-center justify-center font-black opacity-40">{g.title[0]}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold truncate">{g.title}</span>
                  <Pill color={g.status === 'published' ? 'default' : 'yellow'}>{g.status}</Pill>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs opacity-70 mt-0.5">
                  {g.ratingScore != null && <span>★ {g.ratingScore}</span>}
                  {g.reviewCount != null && <span>{g.reviewCount.toLocaleString()} rev</span>}
                  {g.downloads != null && <span>{g.downloads.toLocaleString()} dl</span>}
                  {g.platforms.map(p => <span key={p.id} className="uppercase">{p.platform.name}</span>)}
                  {g.genres.slice(0, 3).map(gn => <span key={gn.id} className="text-brand-fuchsia">{gn.name}</span>)}
                </div>
              </div>
              <Link href={`/admin/games/${g.id}`} className="text-sm font-bold uppercase text-blue-solid hover:underline flex-shrink-0">
                Edit
              </Link>
            </div>
          )
        })}
        {games.length === 0 && <p className="opacity-50 font-bold py-8 text-center">No games match these filters.</p>}
      </div>
    </div>
  )
}
