'use client'

import { useState } from 'react'

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonInput
      })
      
      const data = await res.json()
      if (res.ok) {
        setStatus(`Success: Imported ${data.count} games.`)
        setJsonInput('')
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '2rem', marginBottom: '1rem' }}>
        JSON Bulk Import
      </h1>
      <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
        Paste a JSON array of games to bulk import. Existing games with the same title/slug will be updated.
      </p>

      <div className="bento-box color-pink" style={{ marginBottom: '2rem' }}>
        <div className="bento-header">Expected Schema</div>
        <pre style={{ fontSize: '0.9rem', overflowX: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px' }}>
{`[
  {
    "title": "Braid",
    "releaseYear": 2008,
    "description": "...",
    "coverUrl": "...",
    "genres": ["platformer", "puzzle"],
    "platforms": [
      { "name": "PC/Steam", "storeUrl": "..." }
    ],
    "mechanics": [
      { "name": "Global Rewind", "role": "core", "note": "..." }
    ]
  }
]`}
        </pre>
      </div>

      <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea 
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste JSON array here..." 
          rows={15} 
          style={{ width: '100%', padding: '1rem', fontFamily: 'monospace', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }} 
          required 
        />
        <button type="submit" disabled={loading} className="btn" style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Importing...' : 'Run Import'}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: status.startsWith('Error') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)', borderLeft: \`4px solid \${status.startsWith('Error') ? 'red' : 'green'}\` }}>
          {status}
        </div>
      )}
    </div>
  )
}
