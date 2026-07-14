'use client'

import { useRouter } from 'next/navigation'
import { Dropdown } from '@/components/ui/Dropdown'
import { useState, useEffect } from 'react'

type Props = {
  groups: { name: string, slug: string }[]
  currentQ?: string
  currentGroup?: string
  currentSort?: string
}

export default function MechanicFilters({ groups, currentQ, currentGroup, currentSort }: Props) {
  const router = useRouter()
  
  const [localQ, setLocalQ] = useState(currentQ || '')
  const [localGroup, setLocalGroup] = useState(currentGroup || '')
  const [localSort, setLocalSort] = useState(currentSort || 'alpha')

  useEffect(() => { setLocalQ(currentQ || '') }, [currentQ])
  useEffect(() => { setLocalGroup(currentGroup || '') }, [currentGroup])
  useEffect(() => { setLocalSort(currentSort || 'alpha') }, [currentSort])

  const updateFilters = (newFilters: { q?: string, group?: string, sort?: string }) => {
    const params = new URLSearchParams()
    
    const q = newFilters.q !== undefined ? newFilters.q : localQ
    if (q) params.set('q', q)
    
    const group = newFilters.group !== undefined ? newFilters.group : localGroup
    if (group) params.set('group', group)
    
    const sort = newFilters.sort !== undefined ? newFilters.sort : localSort
    if (sort && sort !== 'alpha') params.set('sort', sort)

    router.push(`/mechanics?${params.toString()}`, { scroll: false })
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
    <div className="mb-12 flex flex-col sm:flex-row gap-4 max-w-4xl bg-zinc-900/50 p-4 rounded-xl border border-white/5">
      <div className="flex-1">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Search Name</label>
        <input 
          type="text" 
          placeholder="e.g. Turn-based..." 
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-violet/50 h-10"
        />
      </div>
      <div className="w-full sm:w-64">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Group Filter</label>
        <Dropdown 
          options={groupOptions} 
          value={localGroup} 
          onChange={(val) => { setLocalGroup(val); updateFilters({ group: val }) }} 
          placeholder="All Groups" 
        />
      </div>
      <div className="w-full sm:w-56">
        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Sort By</label>
        <Dropdown 
          options={sortOptions} 
          value={localSort} 
          onChange={(val) => { setLocalSort(val); updateFilters({ sort: val }) }} 
          placeholder="Alphabetical (A-Z)" 
        />
      </div>
    </div>
  )
}
