'use client'

import { useState } from 'react'

type Game = {
  id: string
  title: string
  mechanicIds: string[]
}

type Mechanic = {
  id: string
  name: string
}

export default function Brainstorm({
  mechanics,
  games
}: {
  mechanics: Mechanic[]
  games: Game[]
}) {
  const [selectedMechanics, setSelectedMechanics] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const toggleMechanic = (id: string) => {
    const newSet = new Set(selectedMechanics)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedMechanics(newSet)
  }

  // Find games that have ALL selected mechanics
  const matchingGames = games.filter(game => {
    if (selectedMechanics.size === 0) return false
    for (const mechanicId of selectedMechanics) {
      if (!game.mechanicIds.includes(mechanicId)) {
        return false
      }
    }
    return true
  })

  // Filter mechanics based on search query
  const filteredMechanics = mechanics.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort mechanics: selected ones first, then alphabetical
  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    const aSelected = selectedMechanics.has(a.id)
    const bSelected = selectedMechanics.has(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="bento-box color-yellow" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="bento-header">Brainstorming (Mechanics Filter)</div>
      <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        Select mechanics to find games that use all of them.
      </p>

      <input 
        type="text" 
        placeholder="Search mechanics..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%' }}
      />
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowY: 'auto', maxHeight: '250px', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
        {sortedMechanics.length > 0 ? sortedMechanics.map(m => {
          const isSelected = selectedMechanics.has(m.id)
          return (
            <button
              key={m.id}
              onClick={() => toggleMechanic(m.id)}
              className="btn"
              style={{
                opacity: isSelected ? 1 : 0.7,
                backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-color)',
                color: isSelected ? 'var(--bg-color)' : 'var(--text-primary)',
                fontSize: '0.85rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              {m.name}
            </button>
          )
        }) : (
          <span style={{ color: 'var(--text-secondary)' }}>No mechanics found matching "{searchQuery}"</span>
        )}
      </div>
      
      <div style={{ marginTop: '1.5rem', padding: '1rem', border: 'var(--border-width) dashed var(--border-color)', minHeight: '80px' }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Matches:</strong>
        {selectedMechanics.size === 0 ? (
          <span style={{ color: 'var(--text-secondary)' }}>Select one or more mechanics above...</span>
        ) : matchingGames.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {matchingGames.map(g => (
              <span key={g.id} style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)' }}>
                {g.title}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>No games found with this combination. Great idea for a new game!</span>
        )}
      </div>
    </div>
  )
}
