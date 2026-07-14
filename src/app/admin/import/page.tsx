'use client'

import { useState } from 'react'

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [report, setReport] = useState<any>(null)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    setReport(null)
    
    try {
      let parsed = []
      try {
        parsed = JSON.parse(jsonInput)
      } catch (err) {
        setStatus('Error: Invalid JSON format.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun, data: parsed })
      })
      
      const resData = await res.json()
      if (res.ok) {
        if (dryRun) {
          setStatus(`Dry Run Complete. Found ${resData.count} valid games. Review the validation report below.`)
          setReport(resData.report)
        } else {
          setStatus(`Success: Imported ${resData.count} games to the database.`)
          setJsonInput('')
          setReport(resData.report)
        }
      } else {
        setStatus(`Error: ${resData.error}`)
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
        JSON Bulk Import / Export
      </h1>
      <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
        Paste a JSON array of games to bulk import. Existing games with the same title/slug will be updated.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <a href="/api/export" download className="btn" style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', background: 'var(--brand-violet)', color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}>
          Download Full Catalog Backup (JSON)
        </a>
      </div>

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
          rows={10} 
          style={{ width: '100%', padding: '1rem', fontFamily: 'monospace', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }} 
          required 
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1.1rem' }}>
          <input 
            type="checkbox" 
            checked={dryRun} 
            onChange={(e) => setDryRun(e.target.checked)} 
            style={{ width: '20px', height: '20px' }}
          />
          <strong>Dry Run</strong> (Validate only, do not write to database)
        </label>

        <button type="submit" disabled={loading} className="btn" style={{ alignSelf: 'flex-start', fontSize: '1.1rem', padding: '1rem 2rem' }}>
          {loading ? 'Processing...' : (dryRun ? 'Run Validation' : 'Execute Import')}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: status.startsWith('Error') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)', borderLeft: `4px solid ${status.startsWith('Error') ? 'red' : 'green'}` }}>
          {status}
        </div>
      )}

      {report && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Validation Report
          </h2>
          
          {report.errors?.length > 0 && (
            <div className="bento-box" style={{ borderColor: 'red' }}>
              <div className="bento-header" style={{ color: 'red' }}>Errors</div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {report.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="bento-box color-purple">
            <div className="bento-header">Mechanics to Auto-Create</div>
            {report.newMechanics?.length > 0 ? (
              <div>
                <p style={{ margin: '0 0 1rem 0', opacity: 0.8 }}>These mechanics do not exist and will be placed in the <strong>Uncategorized</strong> group:</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {report.newMechanics.map((m: string, i: number) => <span key={i} className="mechanic-pill" style={{ backgroundColor: 'var(--color-purple)' }}>{m}</span>)}
                </div>
              </div>
            ) : <p style={{ margin: 0, opacity: 0.7 }}>None. All mechanics already exist.</p>}
          </div>

          <div className="bento-box color-pink">
            <div className="bento-header">Genres to Auto-Create</div>
            {report.newGenres?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {report.newGenres.map((g: string, i: number) => <span key={i} className="mechanic-pill" style={{ backgroundColor: 'var(--color-pink)' }}>{g}</span>)}
              </div>
            ) : <p style={{ margin: 0, opacity: 0.7 }}>None.</p>}
          </div>

          <div className="bento-box color-blue">
            <div className="bento-header">Platforms to Auto-Create</div>
            {report.newPlatforms?.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {report.newPlatforms.map((p: string, i: number) => <span key={i} className="mechanic-pill" style={{ backgroundColor: 'var(--color-blue)' }}>{p}</span>)}
              </div>
            ) : <p style={{ margin: 0, opacity: 0.7 }}>None.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
