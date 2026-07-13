'use client'

import React, { useState, useRef, useEffect } from 'react'

type Option = { label: string; value: string }

type DropdownProps = {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  name?: string // For native forms
  defaultValue?: string // For native forms (uncontrolled)
  required?: boolean
}

export function Dropdown({ 
  options, 
  value: controlledValue, 
  onChange, 
  placeholder = 'Select...',
  name,
  defaultValue,
  required
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Use controlled value if provided, else internal state
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

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

  const selectedOption = options.find(o => o.value === value)

  const handleSelect = (val: string) => {
    if (!isControlled) {
      setInternalValue(val)
    }
    if (onChange) {
      onChange(val)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative w-full text-sm" ref={dropdownRef}>
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 outline-none transition-all focus:border-brand-violet focus:ring-1 focus:ring-brand-violet hover:bg-zinc-800/80"
      >
        <span className={selectedOption ? 'text-zinc-100 font-medium' : 'text-zinc-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-zinc-500 text-xs ml-2">&#9660;</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-auto py-2">
          {!required && (
            <button
              type="button"
              onClick={() => handleSelect('')}
              className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-zinc-400 italic"
            >
              {placeholder}
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2 hover:bg-white/5 transition-colors ${
                value === option.value ? 'text-brand-violet font-bold bg-brand-violet/10' : 'text-zinc-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
