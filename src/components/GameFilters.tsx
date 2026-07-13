'use client'

import { useRouter } from 'next/navigation'
import { BentoBox } from '@/components/ui/BentoBox'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { useState, useEffect } from 'react'

type Props = {
  genres: any[]
  platforms: any[]
  mechanics: any[]
  currentQ?: string
  currentGenre?: string
  currentPlatform?: string
  currentMechanics: string[]
}

export default function GameFilters({ genres, platforms, mechanics, currentQ, currentGenre, currentPlatform, currentMechanics }: Props) {
  const router = useRouter()
  
  const [localQ, setLocalQ] = useState(currentQ || '')
  const [localGenre, setLocalGenre] = useState(currentGenre || '')
  const [localPlatform, setLocalPlatform] = useState(currentPlatform || '')
  const [localMechanics, setLocalMechanics] = useState<string[]>(currentMechanics || [])

  // Sync state if props change from a direct URL hit (e.g. user uses back/forward browser buttons)
  useEffect(() => { setLocalQ(currentQ || '') }, [currentQ])
  useEffect(() => { setLocalGenre(currentGenre || '') }, [currentGenre])
  useEffect(() => { setLocalPlatform(currentPlatform || '') }, [currentPlatform])
  useEffect(() => { setLocalMechanics(currentMechanics || []) }, [currentMechanics])

  const updateFilters = (newFilters: { [key: string]: any }) => {
    const params = new URLSearchParams()
    
    const q = newFilters.q !== undefined ? newFilters.q : localQ
    if (q) params.set('q', q)

    const g = newFilters.genre !== undefined ? newFilters.genre : localGenre
    if (g) params.set('genre', g)

    const p = newFilters.platform !== undefined ? newFilters.platform : localPlatform
    if (p) params.set('platform', p)

    const m = newFilters.mechanics !== undefined ? newFilters.mechanics : localMechanics
    if (m && m.length > 0) {
      params.set('mechanic', m.join(','))
    }

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

  const handleMechanicsChange = (vals: string[]) => {
    setLocalMechanics(vals)
    updateFilters({ mechanics: vals })
  }

  const genreOptions = genres.map(g => ({ label: g.name, value: g.slug }))
  const platformOptions = platforms.map(p => ({ label: p.name, value: p.slug }))
  const mechanicOptions = mechanics.map(m => ({ label: m.name, value: m.slug }))

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
      
      <div className="mt-8">
        <Button 
          variant="ghost"
          onClick={() => { 
            setLocalQ('')
            setLocalGenre('')
            setLocalPlatform('')
            setLocalMechanics([])
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
