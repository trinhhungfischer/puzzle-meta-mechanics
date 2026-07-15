'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pill } from '@/components/ui/Pill'
import { Button } from '@/components/ui/Button'
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
  mechanics: { id: string; role: string; mechanic: { name: string } }[]
  updatedAt: string | Date
}

import { formatInTimeZone } from 'date-fns-tz'

const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || 'Asia/Ho_Chi_Minh'

function fmtUpdated(v: string | Date) {
  try {
    return formatInTimeZone(new Date(v), TIMEZONE, 'yyyy-MM-dd HH:mm')
  } catch (e) {
    return new Date(v).toISOString().slice(0, 16).replace('T', ' ')
  }
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
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 mb-4 p-3 bg-box border-2 border-outline rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-sm uppercase tracking-wider">
          <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="w-4 h-4 accent-brand-violet" />
          Select page
        </label>
        <span className="text-sm font-bold opacity-70">{selected.size} selected</span>
        <div className="flex gap-4">
          <Button onClick={publish} disabled={pending || selected.size === 0} variant="primary">
            Publish Selected ({selected.size})
          </Button>
          <Button onClick={unpublish} disabled={pending || selected.size === 0} variant="secondary">
            Unpublish Selected
          </Button>
          <Button onClick={remove} disabled={pending || selected.size === 0} variant="danger">
            Delete Selected
          </Button>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2">
        {games.map(g => {
          const isSel = selected.has(g.id)
          return (
            <div key={g.id}
              className={`flex items-center gap-3 p-2 rounded-xl border-2 ${isSel ? 'border-brand-violet bg-brand-violet/5' : 'border-outline'}`}>
              <input type="checkbox" checked={isSel} onChange={() => toggle(g.id)} className="w-4 h-4 accent-brand-violet flex-shrink-0" />
              {g.coverUrl
                ? <img src={g.coverUrl} alt="" className="w-12 h-12 object-cover flex-shrink-0 rounded-lg border border-outline" />
                : <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-box border border-outline flex items-center justify-center font-black opacity-40">{g.title[0]}</div>}
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
                  <span className="text-zinc-500" title="last updated (UTC)">⟳ {fmtUpdated(g.updatedAt)}</span>
                </div>
                {g.mechanics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {[...g.mechanics]
                      .sort((a, b) => (a.role === 'core' ? 0 : 1) - (b.role === 'core' ? 0 : 1))
                      .slice(0, 3)
                      .map(m => (
                        <Pill key={m.id} color={m.role === 'core' ? 'default' : 'purple'} className="!text-[0.6rem]">
                          {m.mechanic.name.split(':')[0]}
                        </Pill>
                      ))}
                    {g.mechanics.length > 3 && (
                      <span className="text-[0.6rem] font-bold opacity-60">+{g.mechanics.length - 3}</span>
                    )}
                  </div>
                )}
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
