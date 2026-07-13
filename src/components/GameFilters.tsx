'use client'

import { useRouter } from 'next/navigation'

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

  const updateFilters = (newFilters: { [key: string]: any }) => {
    const params = new URLSearchParams()
    
    const q = newFilters.q !== undefined ? newFilters.q : currentQ
    if (q) params.set('q', q)

    const g = newFilters.genre !== undefined ? newFilters.genre : currentGenre
    if (g) params.set('genre', g)

    const p = newFilters.platform !== undefined ? newFilters.platform : currentPlatform
    if (p) params.set('platform', p)

    const m = newFilters.mechanics !== undefined ? newFilters.mechanics : currentMechanics
    m.forEach((mech: string) => params.append('mechanic', mech))

    router.push(`/?${params.toString()}`)
  }

  const toggleMechanic = (slug: string) => {
    if (currentMechanics.includes(slug)) {
      updateFilters({ mechanics: currentMechanics.filter(m => m !== slug) })
    } else {
      updateFilters({ mechanics: [...currentMechanics, slug] })
    }
  }

  return (
    <div className="bento-box color-blue" style={{ position: 'sticky', top: '2rem' }}>
      <div className="bento-header" style={{ marginBottom: '1rem' }}>Filters</div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Search</label>
        <input 
          type="text" 
          placeholder="Game title..." 
          defaultValue={currentQ}
          onChange={(e) => updateFilters({ q: e.target.value })}
          style={{ width: '100%', marginBottom: 0 }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Genre</label>
        <select 
          value={currentGenre || ''}
          onChange={(e) => updateFilters({ genre: e.target.value })}
          style={{ width: '100%' }}
        >
          <option value="">Any Genre</option>
          {genres.map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Platform</label>
        <select 
          value={currentPlatform || ''}
          onChange={(e) => updateFilters({ platform: e.target.value })}
          style={{ width: '100%' }}
        >
          <option value="">Any Platform</option>
          {platforms.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mechanics (AND)</label>
        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.5rem' }}>
          {mechanics.map(m => (
            <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={currentMechanics.includes(m.slug)}
                onChange={() => toggleMechanic(m.slug)}
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '1.5rem' }}>
        <button 
          onClick={() => { router.push('/') }} 
          className="btn" 
          style={{ width: '100%', backgroundColor: 'var(--border-color)', color: 'var(--bg-color)' }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}
