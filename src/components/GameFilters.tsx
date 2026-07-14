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
  currentMechanicMode?: string
  currentSort?: string
  currentMinRating?: number
  currentMaxRating?: number
  currentMinDownloads?: number
  currentMaxDownloads?: number
  currentMinPrice?: number
  currentMaxPrice?: number
  currentMinYear?: number
  currentMaxYear?: number
  currentFreeOnly?: boolean
}

export default function GameFilters({ 
  genres, platforms, mechanics, groups, 
  currentQ, currentGenre, currentPlatform, currentGroup, currentMechanics, currentMechanicMode, 
  currentSort, 
  currentMinRating, currentMaxRating, 
  currentMinDownloads, currentMaxDownloads, 
  currentMinPrice, currentMaxPrice, 
  currentMinYear, currentMaxYear, 
  currentFreeOnly 
}: Props) {
  const router = useRouter()

  const [localQ, setLocalQ] = useState(currentQ || '')
  const [localGenre, setLocalGenre] = useState(currentGenre || '')
  const [localPlatform, setLocalPlatform] = useState(currentPlatform || '')
  const [localGroup, setLocalGroup] = useState(currentGroup || '')
  const [localMechanics, setLocalMechanics] = useState<string[]>(currentMechanics || [])
  const [localMechanicMode, setLocalMechanicMode] = useState(currentMechanicMode || 'AND')
  const [localSort, setLocalSort] = useState(currentSort || 'title')
  
  const [localMinRating, setLocalMinRating] = useState(currentMinRating ? String(currentMinRating) : '')
  const [localMaxRating, setLocalMaxRating] = useState(currentMaxRating ? String(currentMaxRating) : '')
  
  const [localMinDownloads, setLocalMinDownloads] = useState(currentMinDownloads ? String(currentMinDownloads) : '')
  const [localMaxDownloads, setLocalMaxDownloads] = useState(currentMaxDownloads ? String(currentMaxDownloads) : '')
  
  const [localMinPrice, setLocalMinPrice] = useState(currentMinPrice ? String(currentMinPrice) : '')
  const [localMaxPrice, setLocalMaxPrice] = useState(currentMaxPrice ? String(currentMaxPrice) : '')
  
  const [localMinYear, setLocalMinYear] = useState(currentMinYear ? String(currentMinYear) : '')
  const [localMaxYear, setLocalMaxYear] = useState(currentMaxYear ? String(currentMaxYear) : '')

  const [localFreeOnly, setLocalFreeOnly] = useState(currentFreeOnly || false)

  // Sync state if props change from URL directly
  useEffect(() => { setLocalQ(currentQ || '') }, [currentQ])
  useEffect(() => { setLocalGenre(currentGenre || '') }, [currentGenre])
  useEffect(() => { setLocalPlatform(currentPlatform || '') }, [currentPlatform])
  useEffect(() => { setLocalGroup(currentGroup || '') }, [currentGroup])
  useEffect(() => { setLocalMechanics(currentMechanics || []) }, [currentMechanics])
  useEffect(() => { setLocalMechanicMode(currentMechanicMode || 'AND') }, [currentMechanicMode])
  useEffect(() => { setLocalSort(currentSort || 'title') }, [currentSort])
  useEffect(() => { setLocalMinRating(currentMinRating ? String(currentMinRating) : '') }, [currentMinRating])
  useEffect(() => { setLocalMaxRating(currentMaxRating ? String(currentMaxRating) : '') }, [currentMaxRating])
  useEffect(() => { setLocalMinDownloads(currentMinDownloads ? String(currentMinDownloads) : '') }, [currentMinDownloads])
  useEffect(() => { setLocalMaxDownloads(currentMaxDownloads ? String(currentMaxDownloads) : '') }, [currentMaxDownloads])
  useEffect(() => { setLocalMinPrice(currentMinPrice ? String(currentMinPrice) : '') }, [currentMinPrice])
  useEffect(() => { setLocalMaxPrice(currentMaxPrice ? String(currentMaxPrice) : '') }, [currentMaxPrice])
  useEffect(() => { setLocalMinYear(currentMinYear ? String(currentMinYear) : '') }, [currentMinYear])
  useEffect(() => { setLocalMaxYear(currentMaxYear ? String(currentMaxYear) : '') }, [currentMaxYear])
  useEffect(() => { setLocalFreeOnly(currentFreeOnly || false) }, [currentFreeOnly])

  const updateFilters = (newFilters: { [key: string]: any }) => {
    const params = new URLSearchParams()

    const addParam = (key: string, val: string | undefined | null) => {
      if (val !== undefined && val !== null && val !== '') params.set(key, val)
    }

    addParam('q', newFilters.q !== undefined ? newFilters.q : localQ)
    addParam('genre', newFilters.genre !== undefined ? newFilters.genre : localGenre)
    addParam('platform', newFilters.platform !== undefined ? newFilters.platform : localPlatform)
    addParam('group', newFilters.group !== undefined ? newFilters.group : localGroup)

    const m = newFilters.mechanics !== undefined ? newFilters.mechanics : localMechanics
    if (m && m.length > 0) {
      params.set('mechanic', m.join(','))
      const mode = newFilters.mechanicMode !== undefined ? newFilters.mechanicMode : localMechanicMode
      if (mode !== 'AND') params.set('mechanicMode', mode)
    }

    const sort = newFilters.sort !== undefined ? newFilters.sort : localSort
    if (sort && sort !== 'title') params.set('sort', sort)

    addParam('minRating', newFilters.minRating !== undefined ? newFilters.minRating : localMinRating)
    addParam('maxRating', newFilters.maxRating !== undefined ? newFilters.maxRating : localMaxRating)
    
    addParam('minDownloads', newFilters.minDownloads !== undefined ? newFilters.minDownloads : localMinDownloads)
    addParam('maxDownloads', newFilters.maxDownloads !== undefined ? newFilters.maxDownloads : localMaxDownloads)
    
    addParam('minPrice', newFilters.minPrice !== undefined ? newFilters.minPrice : localMinPrice)
    addParam('maxPrice', newFilters.maxPrice !== undefined ? newFilters.maxPrice : localMaxPrice)
    
    addParam('minYear', newFilters.minYear !== undefined ? newFilters.minYear : localMinYear)
    addParam('maxYear', newFilters.maxYear !== undefined ? newFilters.maxYear : localMaxYear)

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
  const handleDropdown = (key: string) => (val: string) => {
    const setter = {
      genre: setLocalGenre,
      platform: setLocalPlatform,
      group: setLocalGroup,
      sort: setLocalSort
    }[key]
    setter?.(val)
    updateFilters({ [key]: val })
  }

  const handleMechanicsChange = (vals: string[]) => {
    setLocalMechanics(vals)
    updateFilters({ mechanics: vals })
  }

  const handleMechanicMode = (mode: string) => {
    setLocalMechanicMode(mode)
    updateFilters({ mechanicMode: mode })
  }

  const handleRangeChange = (key: string, setter: (v: string) => void) => (val: string) => {
    setter(val)
    updateFilters({ [key]: val })
  }

  const handleFreeOnlyChange = (val: boolean) => {
    setLocalFreeOnly(val)
    updateFilters({ freeOnly: val })
  }

  const genreOptions = genres.map(g => ({ label: g._count ? `${g.name} (${g._count.games})` : g.name, value: g.slug }))
  const platformOptions = platforms.map(p => ({ 
    label: p._count ? `${p.name} (${p._count.games})` : p.name, value: p.slug, icon: <PlatformIcon name={p.name} className="w-4 h-4" />
  }))
  const groupOptions = groups.map(g => ({ label: g._count ? `${g.name} (${g._count.games})` : g.name, value: g.slug }))
  const mechanicOptions = mechanics.map(m => ({ label: m._count ? `${m.name} (${m._count.games})` : m.name, value: m.slug }))
  const sortOptions = [
    { label: 'Title (A-Z)', value: 'title' },
    { label: 'Rating (high → low)', value: 'rating' },
    { label: 'Downloads (high → low)', value: 'downloads' },
    { label: 'Reviews (high → low)', value: 'reviews' },
    { label: 'Release year (new → old)', value: 'year' },
  ]

  return (
    <BentoBox color="blue" header="Filters" className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Search Games</label>
        <input 
          type="text" 
          placeholder="Game title..." 
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="w-full bg-zinc-900/80 border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-violet/50"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Genre</label>
        <Dropdown options={genreOptions} value={localGenre} onChange={handleDropdown('genre')} placeholder="Any Genre" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Platform</label>
        <Dropdown options={platformOptions} value={localPlatform} onChange={handleDropdown('platform')} placeholder="Any Platform" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Mechanic Group</label>
        <Dropdown options={groupOptions} value={localGroup} onChange={handleDropdown('group')} placeholder="Any Group" />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-zinc-300">Mechanics</label>
          <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/5">
            <button 
              onClick={() => handleMechanicMode('AND')}
              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${localMechanicMode === 'AND' ? 'bg-brand-violet text-white font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              AND
            </button>
            <button 
              onClick={() => handleMechanicMode('OR')}
              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${localMechanicMode === 'OR' ? 'bg-brand-violet text-white font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              OR
            </button>
          </div>
        </div>
        <MultiSelect options={mechanicOptions} values={localMechanics} onChange={handleMechanicsChange} placeholder="Search mechanics..." />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-zinc-300">Sort By</label>
        <Dropdown options={sortOptions} value={localSort} onChange={handleDropdown('sort')} placeholder="Title (A-Z)" />
      </div>

      <details className="group mb-4 pt-4 border-t border-white/10">
        <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-zinc-300 uppercase tracking-wider select-none">
          Numeric Ranges
          <span className="transition-transform group-open:rotate-180 opacity-50">▼</span>
        </summary>
        <div className="space-y-4 pt-4">
          <RangeFilter 
            label="Rating (0-100)" 
            min={localMinRating} max={localMaxRating} 
            onMinChange={handleRangeChange('minRating', setLocalMinRating)} 
            onMaxChange={handleRangeChange('maxRating', setLocalMaxRating)} 
          />
          <RangeFilter 
            label="Downloads" 
            min={localMinDownloads} max={localMaxDownloads} 
            onMinChange={handleRangeChange('minDownloads', setLocalMinDownloads)} 
            onMaxChange={handleRangeChange('maxDownloads', setLocalMaxDownloads)} 
          />
          <RangeFilter 
            label="Price ($)" 
            min={localMinPrice} max={localMaxPrice} 
            onMinChange={handleRangeChange('minPrice', setLocalMinPrice)} 
            onMaxChange={handleRangeChange('maxPrice', setLocalMaxPrice)} 
            step="0.01"
          />
          <RangeFilter 
            label="Release Year" 
            min={localMinYear} max={localMaxYear} 
            onMinChange={handleRangeChange('minYear', setLocalMinYear)} 
            onMaxChange={handleRangeChange('maxYear', setLocalMaxYear)} 
          />
        </div>
      </details>

      <div className="mb-4 pt-4 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-300">
          <input type="checkbox" checked={localFreeOnly} onChange={(e) => handleFreeOnlyChange(e.target.checked)} className="w-4 h-4 accent-brand-violet" />
          Free games only
        </label>
      </div>

      <div className="mt-8">
        <Button
          variant="ghost"
          onClick={() => {
            setLocalQ(''); setLocalGenre(''); setLocalPlatform(''); setLocalGroup('');
            setLocalMechanics([]); setLocalMechanicMode('AND'); setLocalSort('title');
            setLocalMinRating(''); setLocalMaxRating('');
            setLocalMinDownloads(''); setLocalMaxDownloads('');
            setLocalMinPrice(''); setLocalMaxPrice('');
            setLocalMinYear(''); setLocalMaxYear('');
            setLocalFreeOnly(false);
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

function RangeFilter({ 
  label, min, max, onMinChange, onMaxChange, step = "1" 
}: { 
  label: string, min: string, max: string, step?: string,
  onMinChange: (val: string) => void, onMaxChange: (val: string) => void 
}) {
  return (
    <div>
      <div className="text-xs text-zinc-400 mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="number" min="0" step={step} placeholder="Min" value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-full bg-zinc-900/80 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
        />
        <span className="text-zinc-600">-</span>
        <input
          type="number" min="0" step={step} placeholder="Max" value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className="w-full bg-zinc-900/80 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-violet/50"
        />
      </div>
    </div>
  )
}
