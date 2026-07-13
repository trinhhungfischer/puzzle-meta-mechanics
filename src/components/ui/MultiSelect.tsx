'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'

type Option = { label: string; value: string }

type MultiSelectProps = {
  options: Option[]
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, values, onChange, placeholder = 'Search...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unselectedOptions = useMemo(() => {
    return options.filter(o => !values.includes(o.value))
  }, [options, values])

  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase()
    return unselectedOptions.filter(o => o.label.toLowerCase().includes(q))
  }, [unselectedOptions, search])

  const handleSelect = (val: string) => {
    onChange([...values, val])
    setSearch('')
    // Keep dropdown open and focus on input so they can add multiple
    inputRef.current?.focus()
  }

  const handleRemove = (e: React.MouseEvent, val: string) => {
    e.stopPropagation()
    onChange(values.filter(v => v !== val))
  }

  const selectedOptions = options.filter(o => values.includes(o.value))

  return (
    <div className="relative w-full text-sm" ref={dropdownRef}>
      {/* Container acting as the "input" field */}
      <div 
        className="w-full min-h-[48px] bg-zinc-900/80 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 items-center cursor-text transition-all focus-within:border-brand-violet focus-within:ring-1 focus-within:ring-brand-violet hover:bg-zinc-800/80"
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
      >
        {selectedOptions.map(opt => (
          <span 
            key={opt.value} 
            className="flex items-center gap-1 bg-brand-violet/20 text-brand-violet border border-brand-violet/30 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm"
          >
            {opt.label}
            <button 
              type="button" 
              onClick={(e) => handleRemove(e, opt.value)}
              className="hover:text-white transition-colors ml-1 font-black opacity-70 hover:opacity-100"
            >
              &times;
            </button>
          </span>
        ))}
        
        <input 
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-500 py-1"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto py-2">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-white/10 transition-colors text-zinc-300 hover:text-white"
              >
                <span className="text-brand-cyan opacity-50">+</span>
                <span>{option.label}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-zinc-500 italic text-center">
              {unselectedOptions.length === 0 ? 'All mechanics selected.' : 'No mechanics found.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
