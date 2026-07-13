'use client'

import { useState } from 'react'

type Mechanic = {
  id: string
  name: string
}

export default function MechanicSelector({ mechanics }: { mechanics: Mechanic[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMechanics, setSelectedMechanics] = useState<Set<string>>(new Set())

  const toggleMechanic = (id: string) => {
    const newSet = new Set(selectedMechanics)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedMechanics(newSet)
  }

  const filteredMechanics = mechanics.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    const aSelected = selectedMechanics.has(a.id)
    const bSelected = selectedMechanics.has(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div>
      <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Assign Mechanics:</p>
      
      <input 
        type="text" 
        placeholder="Filter mechanics..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '0.5rem', width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault() // prevent form submission when pressing enter in search
          }
        }}
      />

      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        flexWrap: 'wrap', 
        overflowY: 'auto', 
        maxHeight: '200px', 
        padding: '0.5rem', 
        border: '1px solid var(--border-color)',
        borderRadius: '4px'
      }}>
        {sortedMechanics.length > 0 ? sortedMechanics.map(m => {
          const isSelected = selectedMechanics.has(m.id)
          return (
            <label 
              key={m.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                border: '1px solid var(--border-color)', 
                padding: '0.25rem 0.5rem', 
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-color)',
                color: isSelected ? 'var(--bg-color)' : 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <input 
                type="checkbox" 
                name="mechanics" 
                value={m.id} 
                checked={isSelected}
                onChange={() => toggleMechanic(m.id)}
                style={{ width: 'auto', marginBottom: 0, display: 'none' }} 
              />
              {m.name}
            </label>
          )
        }) : (
          <span style={{ color: 'var(--text-secondary)' }}>No mechanics found.</span>
        )}
      </div>
    </div>
  )
}
