import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { z } from 'zod'

const searchSchema = z.string().max(50).regex(/^[a-zA-Z0-9\s\-_]*$/, 'Invalid search format')

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [local, setLocal] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value changes (e.g. filter reset)
  useEffect(() => {
    setLocal(value)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (v !== '' && !searchSchema.safeParse(v).success) return // Reject invalid input
    
    setLocal(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), debounceMs)
  }

  function handleClear() {
    setLocal('')
    if (timer.current) clearTimeout(timer.current)
    onChange('')
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
      <input
        id="faculty-search-input"
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2',
          'text-sm text-[#001941] placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-[#001941] focus:border-transparent transition-shadow'
        )}
      />
      {local && (
        <button
          onClick={handleClear}
          className="absolute right-2 rounded p-0.5 text-slate-500 hover:text-slate-200 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
