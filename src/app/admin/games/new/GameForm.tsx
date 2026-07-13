'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGameWithRelations, updateGameWithRelations } from '../../actions'
import { BentoBox } from '@/components/ui/BentoBox'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'

type Props = {
  genres: any[]
  platforms: any[]
  mechanics: any[]
  initialData?: any
}

export default function GameForm({ genres, platforms, mechanics, initialData }: Props) {
  const router = useRouter()
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialData ? initialData.genres.map((g: any) => g.id) : []
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ platformId: string; storeUrl: string }[]>(
    initialData ? initialData.platforms.map((p: any) => ({ platformId: p.platformId, storeUrl: p.storeUrl || '' })) : []
  )
  const [selectedMechanics, setSelectedMechanics] = useState<{ mechanicId: string; role: string; note: string }[]>(
    initialData ? initialData.mechanics.map((m: any) => ({ mechanicId: m.mechanicId, role: m.role, note: m.note || '' })) : []
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const num = (key: string): number | null => {
      const v = formData.get(key) as string | null
      if (v === null || v.trim() === '') return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    const data = {
      title: formData.get('title') as string,
      releaseYear: formData.get('releaseYear') ? parseInt(formData.get('releaseYear') as string) : null,
      description: formData.get('description') as string,
      coverUrl: formData.get('coverUrl') as string,
      genres: selectedGenres,
      platforms: selectedPlatforms,
      mechanics: selectedMechanics,
      ratingScore: num('ratingScore'),
      ratingCount: num('ratingCount'),
      downloads: num('downloads'),
      reviewCount: num('reviewCount'),
      price: num('price'),
      isFree: formData.get('isFree') === 'on',
    }

    if (initialData) {
      await updateGameWithRelations(initialData.id, data)
    } else {
      await createGameWithRelations(data)
    }
    
    router.push('/admin/games')
  }

  const platformOptions = platforms.map(p => ({ label: p.name, value: p.id }))
  const mechanicOptions = mechanics.map(m => ({ label: m.name, value: m.id }))
  const roleOptions = [
    { label: 'Core', value: 'core' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Twist', value: 'twist' }
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Basic Info */}
      <BentoBox color="yellow" header="Basic Info">
        <div className="flex flex-wrap gap-4 mb-4">
          <input type="text" name="title" defaultValue={initialData?.title} placeholder="Game Title" required className="flex-[2] min-w-[300px]" />
          <input type="number" name="releaseYear" defaultValue={initialData?.releaseYear || ''} placeholder="Release Year" className="flex-1 min-w-[100px]" />
        </div>
        <input type="text" name="coverUrl" defaultValue={initialData?.coverUrl || ''} placeholder="Cover Image URL" className="w-full mb-4" />
        <textarea name="description" defaultValue={initialData?.description || ''} placeholder="Description" rows={3} className="w-full" />
      </BentoBox>

      {/* Metrics (US-024) — aggregate signals for filtering/sorting. Optional. */}
      <BentoBox color="green" header="Metrics">
        <div className="flex flex-wrap gap-4">
          <input type="number" step="0.1" min="0" max="100" name="ratingScore" defaultValue={initialData?.ratingScore ?? ''} placeholder="Rating score (0-100)" className="flex-1 min-w-[160px]" />
          <input type="number" min="0" name="ratingCount" defaultValue={initialData?.ratingCount ?? ''} placeholder="Rating count" className="flex-1 min-w-[160px]" />
          <input type="number" min="0" name="reviewCount" defaultValue={initialData?.reviewCount ?? ''} placeholder="Review count" className="flex-1 min-w-[160px]" />
          <input type="number" min="0" name="downloads" defaultValue={initialData?.downloads ?? ''} placeholder="Downloads" className="flex-1 min-w-[160px]" />
          <input type="number" step="0.01" min="0" name="price" defaultValue={initialData?.price ?? ''} placeholder="Price (USD)" className="flex-1 min-w-[160px]" />
          <label className="flex items-center gap-2 cursor-pointer px-2">
            <input type="checkbox" name="isFree" defaultChecked={initialData?.isFree ?? false} className="w-4 h-4 accent-brand-fuchsia" />
            <span className="text-zinc-300">Free</span>
          </label>
        </div>
      </BentoBox>

      {/* Genres */}
      <BentoBox color="pink" header="Genres">
        <div className="flex flex-wrap gap-4">
          {genres.map(g => (
            <label key={g.id} className="flex items-center gap-2 cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition-colors">
              <input 
                type="checkbox" 
                checked={selectedGenres.includes(g.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedGenres([...selectedGenres, g.id])
                  else setSelectedGenres(selectedGenres.filter(id => id !== g.id))
                }}
                className="w-4 h-4 rounded cursor-pointer accent-brand-fuchsia"
              />
              <span className={selectedGenres.includes(g.id) ? "text-white font-bold" : "text-zinc-400 group-hover:text-zinc-200"}>
                {g.name}
              </span>
            </label>
          ))}
        </div>
      </BentoBox>

      {/* Platforms */}
      <BentoBox color="blue" header="Platforms">
        <div className="flex flex-col gap-4">
          {selectedPlatforms.map((p, idx) => (
            <div key={idx} className="flex flex-wrap gap-4 items-start">
              <div className="flex-1 min-w-[200px]">
                <Dropdown 
                  options={platformOptions}
                  value={p.platformId}
                  onChange={val => {
                    const newP = [...selectedPlatforms]
                    newP[idx].platformId = val
                    setSelectedPlatforms(newP)
                  }}
                  placeholder="Select Platform"
                />
              </div>
              <input 
                type="text" 
                placeholder="Store URL (optional)" 
                value={p.storeUrl}
                onChange={e => {
                  const newP = [...selectedPlatforms]
                  newP[idx].storeUrl = e.target.value
                  setSelectedPlatforms(newP)
                }}
                className="flex-[2] min-w-[200px]"
              />
              <button 
                type="button" 
                onClick={() => setSelectedPlatforms(selectedPlatforms.filter((_, i) => i !== idx))} 
                className="text-red-500 hover:text-red-400 font-bold text-xl px-2 py-1"
              >
                &times;
              </button>
            </div>
          ))}
          <Button type="button" onClick={() => setSelectedPlatforms([...selectedPlatforms, { platformId: '', storeUrl: '' }])} variant="secondary" className="self-start">
            + Add Platform
          </Button>
        </div>
      </BentoBox>

      {/* Mechanics */}
      <BentoBox color="purple" header="Mechanics">
        <div className="flex flex-col gap-4">
          {selectedMechanics.map((m, idx) => (
            <div key={idx} className="flex flex-wrap gap-4 items-start bg-zinc-900/30 p-4 rounded-xl border border-white/5">
              <div className="flex-[2] min-w-[250px]">
                <Dropdown 
                  options={mechanicOptions}
                  value={m.mechanicId}
                  onChange={val => {
                    const newM = [...selectedMechanics]
                    newM[idx].mechanicId = val
                    setSelectedMechanics(newM)
                  }}
                  placeholder="Select Mechanic"
                />
              </div>
              
              <div className="flex-1 min-w-[120px]">
                <Dropdown 
                  options={roleOptions}
                  value={m.role}
                  onChange={val => {
                    const newM = [...selectedMechanics]
                    newM[idx].role = val
                    setSelectedMechanics(newM)
                  }}
                  placeholder="Role"
                />
              </div>

              <input 
                type="text" 
                placeholder="Note (e.g. how it is used)" 
                value={m.note}
                onChange={e => {
                  const newM = [...selectedMechanics]
                  newM[idx].note = e.target.value
                  setSelectedMechanics(newM)
                }}
                className="flex-[3] min-w-[200px]"
              />
              <button 
                type="button" 
                onClick={() => setSelectedMechanics(selectedMechanics.filter((_, i) => i !== idx))} 
                className="text-red-500 hover:text-red-400 font-bold text-xl px-2 py-1"
              >
                &times;
              </button>
            </div>
          ))}
          <Button type="button" onClick={() => setSelectedMechanics([...selectedMechanics, { mechanicId: '', role: 'core', note: '' }])} variant="secondary" className="self-start">
            + Add Mechanic
          </Button>
        </div>
      </BentoBox>

      <Button type="submit" variant="primary" className="self-start text-lg px-8 py-3">
        {initialData ? 'Save Changes' : 'Create Game'}
      </Button>
    </form>
  )
}
