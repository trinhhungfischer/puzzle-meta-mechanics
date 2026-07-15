'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

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
      <div className="flex gap-4">
        <Button disabled={isRunning} onClick={() => triggerCrawl('steam')} variant="secondary" className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border-blue-600/30">
          Run Steam Crawl
        </Button>
        <Button disabled={isRunning} onClick={() => triggerCrawl('mobile')} variant="secondary" className="bg-green-600/20 text-green-400 hover:bg-green-600/40 border-green-600/30">
          Run Mobile Crawl
        </Button>
      </div>
      
      {logs.length > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[90vw] sm:w-[600px] bg-zinc-950 border border-zinc-700 rounded-lg p-4 h-64 overflow-y-auto font-mono text-[10px] sm:text-xs shadow-2xl z-50">
          <div className="flex justify-between items-center mb-2 text-xs border-b border-zinc-800 pb-2">
            <span className="text-zinc-500 font-mono">Terminal Output {isRunning && <span className="animate-pulse text-green-500">●</span>}</span>
            <Button onClick={() => setLogs([])} variant="ghost" className="px-2 py-1 h-auto text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white">Clear</Button>
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
