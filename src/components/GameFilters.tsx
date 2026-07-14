'use client'

import { useRouter } from 'next/navigation'
import { BentoBox } from '@/components/ui/BentoBox'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { useState, useEffect } from 'react'

type Props = {
  genres: any[]
  platforms: any[]
  mechanics: any[]
  groups: any[]
  currentQ?: string
  currentGenre?: string
  currentPlatform?: string
  currentGroup?: string
  currentMechanics: string[]
  currentSort?: string
  currentMinRating?: number
  currentFreeOnly?: boolean
}

export default function GameFilters({ genres, platforms, mechanics, groups, currentQ, currentGenre, currentPlatform, currentGroup, currentMechanics, currentSort, currentMinRating, currentFreeOnly }: Props) {
  const router = useRouter()

  const [localQ, setLocalQ] = useState(currentQ || '')
  const [localGenre, setLocalGenre] = useState(currentGenre || '')
  const [localPlatform, setLocalPlatform] = useState(currentPlatform || '')
  const [localGroup, setLocalGroup] = useState(currentGroup || '')
  const [localMechanics, setLocalMechanics] = useState<string[]>(currentMechanics || [])
  const [localSort, setLocalSort] = useState(currentSort || 'title')
  const [localMinRating, setLocalMinRating] = useState(currentMinRating ? String(currentMinRating) : '')
  const [localFreeOnly, setLocalFreeOnly] = useState(currentFreeOnly || false)

  // Sync state if props change from a direct URL hit (e.g. user uses back/forward browser buttons)
  useEffect(() => { setLocalQ(currentQ || '') }, [currentQ])
  useEffect(() => { setLocalGenre(currentGenre || '') }, [currentGenre])
  useEffect(() => { setLocalPlatform(currentPlatform || '') }, [currentPlatform])
  useEffect(() => { setLocalGroup(currentGroup || '') }, [currentGroup])
  useEffect(() => { setLocalMechanics(currentMechanics || []) }, [currentMechanics])
  useEffect(() => { setLocalSort(currentSort || 'title') }, [currentSort])
  useEffect(() => { setLocalMinRating(currentMinRating ? String(currentMinRating) : '') }, [currentMinRating])
  useEffect(() => { setLocalFreeOnly(currentFreeOnly || false) }, [currentFreeOnly])

  const updateFilters = (newFilters: { [key: string]: any }) => {
    const params = new URLSearchParams()

    const q = newFilters.q !== undefined ? newFilters.q : localQ
    if (q) params.set('q', q)

    const g = newFilters.genre !== undefined ? newFilters.genre : localGenre
    if (g) params.set('genre', g)

    const p = newFilters.platform !== undefined ? newFilters.platform : localPlatform
    if (p) params.set('platform', p)

    const grp = newFilters.group !== undefined ? newFilters.group : localGroup
    if (grp) params.set('group', grp)

    const m = newFilters.mechanics !== undefined ? newFilters.mechanics : localMechanics
    if (m && m.length > 0) {
      params.set('mechanic', m.join(','))
    }

    const sort = newFilters.sort !== undefined ? newFilters.sort : localSort
    if (sort && sort !== 'title') params.set('sort', sort)

    const minRating = newFilters.minRating !== undefined ? newFilters.minRating : localMinRating
    if (minRating) params.set('minRating', minRating)

    const freeOnly = newFilters.freeOnly !== undefined ? newFilters.freeOnly : localFreeOnly
    if (freeOnly) params.set('free', '1')

    router.push(`/?${params.toString()}`, { scroll: false })
  }

  // Debounce effect for title search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQ !== (currentQ || '')) {
        updateFilters({ q: localQ })
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [localQ, currentQ])

  // Handlers for instant UI updates
  const handleGenreChange = (val: string) => {
    setLocalGenre(val)
    updateFilters({ genre: val })
  }

  const handlePlatformChange = (val: string) => {
    setLocalPlatform(val)
    updateFilters({ platform: val })
  }

  const handleGroupChange = (val: string) => {
    setLocalGroup(val)
    updateFilters({ group: val })
  }

  const handleMechanicsChange = (vals: string[]) => {
    setLocalMechanics(vals)
    updateFilters({ mechanics: vals })
  }

  const handleSortChange = (val: string) => {
    setLocalSort(val)
    updateFilters({ sort: val })
  }

  const handleMinRatingChange = (val: string) => {
    setLocalMinRating(val)
    updateFilters({ minRating: val })
  }

  const handleFreeOnlyChange = (val: boolean) => {
    setLocalFreeOnly(val)
    updateFilters({ freeOnly: val })
  }

  const genreOptions = genres.map(g => ({ label: g.name, value: g.slug }))
  const platformOptions = platforms.map(p => ({ 
    label: p.name, 
    value: p.slug,
    icon: <PlatformIcon name={p.name} className="w-4 h-4" />
  }))
  const groupOptions = groups.map(g => ({ label: g.name, value: g.slug }))
  const mechanicOptions = mechanics.map(m => ({ label: m.name, value: m.slug }))
  const sortOptions = [
    { label: 'Title (A-Z)', value: 'title' },
    { label: 'Rating (high → low)', value: 'rating' },
    { label: 'Downloads (high → low)', value: 'downloads' },
    { label: 'Reviews (high → low)', value: 'reviews' },
    { label: 'Release year (new → old)', value: 'year' },
  ]

  return (
    <BentoBox color="blue" header="Filters" className="sticky top-8">
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Search Games</label>
        <input 
          type="text" 
          placeholder="Game title..." 
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="w-full bg-zinc-900/80 border-white/10"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Genre</label>
        <Dropdown 
          options={genreOptions} 
          value={localGenre} 
          onChange={handleGenreChange} 
          placeholder="Any Genre"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Platform</label>
        <Dropdown 
          options={platformOptions} 
          value={localPlatform} 
          onChange={handlePlatformChange} 
          placeholder="Any Platform"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300 flex justify-between items-center">
          <span>Mechanic Group</span>
        </label>
        <Dropdown 
          options={groupOptions} 
          value={localGroup} 
          onChange={handleGroupChange} 
          placeholder="Any Group"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300 flex justify-between items-center">
          <span>Mechanics (AND)</span>
          {localMechanics.length > 0 && (
            <span className="bg-brand-violet/20 text-brand-violet px-2 py-0.5 rounded-full text-xs">
              {localMechanics.length}
            </span>
          )}
        </label>
        <MultiSelect 
          options={mechanicOptions}
          values={localMechanics}
          onChange={handleMechanicsChange}
          placeholder="Search mechanics..."
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Sort By</label>
        <Dropdown
          options={sortOptions}
          value={localSort}
          onChange={handleSortChange}
          placeholder="Title (A-Z)"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Min Rating (0-100)</label>
        <input
          type="number"
          min="0"
          max="100"
          placeholder="e.g. 80"
          value={localMinRating}
          onChange={(e) => handleMinRatingChange(e.target.value)}
          className="w-full bg-zinc-900/80 border-white/10"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-300">
          <input
            type="checkbox"
            checked={localFreeOnly}
            onChange={(e) => handleFreeOnlyChange(e.target.checked)}
            className="w-4 h-4 accent-brand-violet"
          />
          Free games only
        </label>
      </div>

      <div className="mt-8">
        <Button
          variant="ghost"
          onClick={() => {
            setLocalQ('')
            setLocalGenre('')
            setLocalPlatform('')
            setLocalGroup('')
            setLocalMechanics([])
            setLocalSort('title')
            setLocalMinRating('')
            setLocalFreeOnly(false)
            router.push('/', { scroll: false })
          }}
          className="w-full bg-white/5 border-white/10 hover:bg-white/10"
        >
          Clear All Filters
        </Button>
      </div>
    </BentoBox>
  )
}
