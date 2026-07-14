'use client'
import { useState, useRef, useEffect } from 'react'

export function CrawlButtons() {
  const [logs, setLogs] = useState<{text: string, error?: boolean}[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const triggerCrawl = (target: 'steam' | 'mobile') => {
    if (isRunning) return
    setIsRunning(true)
    setLogs([{ text: `Starting ${target}...` }])
    
    const eventSource = new EventSource(`/api/admin/crawl?target=${target}`, { withCredentials: true })
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLogs(prev => [...prev, data])
      
      if (data.done) {
        eventSource.close()
        setIsRunning(false)
      }
    }

    eventSource.onerror = (err) => {
      setLogs(prev => [...prev, { text: 'Connection lost or stream ended.', error: true }])
      eventSource.close()
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-2 sm:mt-0 w-full relative z-10">
      <div className="flex gap-2 items-center justify-end">
        <button disabled={isRunning} onClick={() => triggerCrawl('steam')} className="px-3 py-1.5 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white text-xs rounded-md font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed">Run Steam Crawl</button>
        <button disabled={isRunning} onClick={() => triggerCrawl('mobile')} className="px-3 py-1.5 bg-green-600 disabled:opacity-50 hover:bg-green-700 text-white text-xs rounded-md font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed">Run Mobile Crawl</button>
      </div>
      
      {logs.length > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[90vw] sm:w-[600px] bg-zinc-950 border border-zinc-700 rounded-lg p-4 h-64 overflow-y-auto font-mono text-[10px] sm:text-xs shadow-2xl z-50">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-800">
            <span className="text-zinc-400 font-bold uppercase tracking-wider">Crawler Log Terminal</span>
            <button onClick={() => setLogs([])} className="text-zinc-500 hover:text-white px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-colors">Clear</button>
          </div>
          {logs.map((log, i) => (
            <div key={i} className={`whitespace-pre-wrap leading-relaxed ${log.error ? 'text-red-400' : 'text-emerald-400'}`}>
              {log.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  )
}
