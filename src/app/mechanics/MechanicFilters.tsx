'use client'

import { useRouter } from 'next/navigation'
import { Dropdown } from '@/components/ui/Dropdown'
import { useState, useEffect } from 'react'
import { GridFour, Columns } from '@phosphor-icons/react'

type Props = {
  groups: { name: string, slug: string }[]
  currentQ?: string
  currentGroup?: string
  currentSort?: string
  currentView?: string
  onViewChange?: (view: string) => void
}

export default function MechanicFilters({ groups, currentQ, currentGroup, currentSort, currentView = 'grid', onViewChange }: Props) {
  const router = useRouter()
  
  const [localQ, setLocalQ] = useState(currentQ || '')
  const [localGroup, setLocalGroup] = useState(currentGroup || '')
  const [localSort, setLocalSort] = useState(currentSort || 'alpha')
  const [localView, setLocalView] = useState(currentView)

  useEffect(() => { setLocalQ(currentQ || '') }, [currentQ])
  useEffect(() => { setLocalGroup(currentGroup || '') }, [currentGroup])
  useEffect(() => { setLocalSort(currentSort || 'alpha') }, [currentSort])
  useEffect(() => { setLocalView(currentView) }, [currentView])

  const updateFilters = (newFilters: { q?: string, group?: string, sort?: string }) => {
    const params = new URLSearchParams()
    
    const q = newFilters.q !== undefined ? newFilters.q : localQ
    if (q) params.set('q', q)
    
    const group = newFilters.group !== undefined ? newFilters.group : localGroup
    if (group) params.set('group', group)
    
    const sort = newFilters.sort !== undefined ? newFilters.sort : localSort
    if (sort && sort !== 'alpha') params.set('sort', sort)

    if (localView && localView !== 'grid') params.set('view', localView)

    router.push(`/mechanics?${params.toString()}`, { scroll: false })
  }

  const handleViewToggle = (newView: string) => {
    setLocalView(newView)
    if (onViewChange) onViewChange(newView)
    
    // Update URL instantly without triggering Next.js Server Component refetch
    const url = new URL(window.location.href)
    if (newView === 'grid') {
      url.searchParams.delete('view')
    } else {
      url.searchParams.set('view', newView)
    }
    window.history.replaceState(null, '', url.toString())
  }

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQ !== (currentQ || '')) {
        updateFilters({ q: localQ })
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [localQ, currentQ])

  const groupOptions = groups.map(g => ({ label: g.name, value: g.slug }))
  const sortOptions = [
    { label: 'Alphabetical (A-Z)', value: 'alpha' },
    { label: 'Most Used', value: 'usage' }
  ]

  return (
    <div className="mb-12 flex flex-col sm:flex-row gap-4 max-w-5xl bg-zinc-900/50 p-4 rounded-xl border border-white/5">
      <div className="flex-1">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Search Name</label>
        <input 
          type="text" 
          placeholder="e.g. Turn-based..." 
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 h-10"
        />
      </div>
      <div className="w-full sm:w-56">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Group Filter</label>
        <Dropdown 
          options={groupOptions} 
          value={localGroup} 
          onChange={(val) => { setLocalGroup(val); updateFilters({ group: val }) }} 
          placeholder="All Groups" 
        />
      </div>
      <div className="w-full sm:w-48">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Sort By</label>
        <Dropdown 
          options={sortOptions} 
          value={localSort} 
          onChange={(val) => { setLocalSort(val); updateFilters({ sort: val }) }} 
          placeholder="Alphabetical (A-Z)" 
        />
      </div>
      <div className="flex flex-col">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">View</label>
        <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10 h-10 items-center">
          <button 
            onClick={() => handleViewToggle('grid')}
            className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded-md transition-colors ${localView === 'grid' || !localView ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Grid View"
          >
            <GridFour weight="fill" className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleViewToggle('board')}
            className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded-md transition-colors ${localView === 'board' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Board View"
          >
            <Columns weight="fill" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
