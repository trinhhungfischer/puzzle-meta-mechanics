'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGameWithRelations } from '../../actions'

type Props = {
  genres: any[]
  platforms: any[]
  mechanics: any[]
}

export default function GameForm({ genres, platforms, mechanics }: Props) {
  const router = useRouter()
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ platformId: string; storeUrl: string }[]>([])
  const [selectedMechanics, setSelectedMechanics] = useState<{ mechanicId: string; role: string; note: string }[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await createGameWithRelations({
      title: formData.get('title') as string,
      releaseYear: formData.get('releaseYear') ? parseInt(formData.get('releaseYear') as string) : null,
      description: formData.get('description') as string,
      coverUrl: formData.get('coverUrl') as string,
      genres: selectedGenres,
      platforms: selectedPlatforms,
      mechanics: selectedMechanics
    })
    
    router.push('/admin/games')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Basic Info */}
      <div className="bento-box color-yellow">
        <div className="bento-header">Basic Info</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input type="text" name="title" placeholder="Game Title" required style={{ flex: '2 1 300px' }} />
          <input type="number" name="releaseYear" placeholder="Release Year" style={{ flex: '1 1 100px' }} />
        </div>
        <input type="text" name="coverUrl" placeholder="Cover Image URL" style={{ width: '100%', marginBottom: '1rem' }} />
        <textarea name="description" placeholder="Description" rows={3} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
      </div>

      {/* Genres */}
      <div className="bento-box color-pink">
        <div className="bento-header">Genres</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {genres.map(g => (
            <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedGenres.includes(g.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedGenres([...selectedGenres, g.id])
                  else setSelectedGenres(selectedGenres.filter(id => id !== g.id))
                }}
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="bento-box color-blue">
        <div className="bento-header">Platforms</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedPlatforms.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={p.platformId}
                onChange={e => {
                  const newP = [...selectedPlatforms]
                  newP[idx].platformId = e.target.value
                  setSelectedPlatforms(newP)
                }}
                style={{ flex: 1 }}
              >
                <option value="" disabled>Select Platform</option>
                {platforms.map(plat => <option key={plat.id} value={plat.id}>{plat.name}</option>)}
              </select>
              <input 
                type="text" 
                placeholder="Store URL (optional)" 
                value={p.storeUrl}
                onChange={e => {
                  const newP = [...selectedPlatforms]
                  newP[idx].storeUrl = e.target.value
                  setSelectedPlatforms(newP)
                }}
                style={{ flex: 2, marginBottom: 0 }}
              />
              <button type="button" onClick={() => setSelectedPlatforms(selectedPlatforms.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => setSelectedPlatforms([...selectedPlatforms, { platformId: '', storeUrl: '' }])} className="btn" style={{ alignSelf: 'flex-start' }}>+ Add Platform</button>
        </div>
      </div>

      {/* Mechanics */}
      <div className="bento-box color-purple">
        <div className="bento-header">Mechanics</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedMechanics.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select 
                value={m.mechanicId}
                onChange={e => {
                  const newM = [...selectedMechanics]
                  newM[idx].mechanicId = e.target.value
                  setSelectedMechanics(newM)
                }}
                style={{ flex: '2 1 200px' }}
              >
                <option value="" disabled>Select Mechanic</option>
                {mechanics.map(mech => <option key={mech.id} value={mech.id}>{mech.name}</option>)}
              </select>
              
              <select 
                value={m.role}
                onChange={e => {
                  const newM = [...selectedMechanics]
                  newM[idx].role = e.target.value
                  setSelectedMechanics(newM)
                }}
                style={{ flex: '1 1 100px' }}
              >
                <option value="core">Core</option>
                <option value="secondary">Secondary</option>
                <option value="twist">Twist</option>
              </select>

              <input 
                type="text" 
                placeholder="Note (e.g. how it is used)" 
                value={m.note}
                onChange={e => {
                  const newM = [...selectedMechanics]
                  newM[idx].note = e.target.value
                  setSelectedMechanics(newM)
                }}
                style={{ flex: '3 1 200px', marginBottom: 0 }}
              />
              <button type="button" onClick={() => setSelectedMechanics(selectedMechanics.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => setSelectedMechanics([...selectedMechanics, { mechanicId: '', role: 'core', note: '' }])} className="btn" style={{ alignSelf: 'flex-start' }}>+ Add Mechanic</button>
        </div>
      </div>

      <button type="submit" className="btn" style={{ alignSelf: 'flex-start', fontSize: '1.2rem', padding: '1rem 2rem' }}>Save Game</button>
    </form>
  )
}
