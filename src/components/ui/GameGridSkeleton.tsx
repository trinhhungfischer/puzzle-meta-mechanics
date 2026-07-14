import React from 'react'

export function GameGridSkeleton() {
  return (
    <div className="flex-1 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 bg-white/10 rounded w-48 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="glass-panel h-[320px] rounded-2xl flex flex-col overflow-hidden animate-pulse">
            <div className="h-[200px] w-full bg-white/5 border-b border-white/5" />
            <div className="p-5 flex-grow flex flex-col">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
              <div className="flex gap-2 mb-3">
                <div className="h-4 w-4 rounded bg-white/10" />
                <div className="h-4 w-4 rounded bg-white/10" />
              </div>
              <div className="flex gap-1.5 mb-4">
                <div className="h-5 w-16 rounded-full bg-white/10" />
                <div className="h-5 w-20 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
