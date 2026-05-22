'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Hash, Plus, Loader2 } from 'lucide-react'
import { getHashtags, createHashtag } from '@/app/actions/community'
import type { Hashtag } from '@/lib/supabase/types'

interface HashtagInputProps {
  value: Hashtag[]
  onChange: (tags: Hashtag[]) => void
  maxTags?: number
}

export function HashtagInput({ value, onChange, maxTags = 5 }: HashtagInputProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoading(true)
    const results = await getHashtags(q || undefined)
    setSuggestions(results.filter(r => !value.some(v => v.id === r.id)))
    setLoading(false)
  }, [value])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (open) fetchSuggestions(query)
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, open, fetchSuggestions])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleFocus() {
    if (value.length < maxTags) {
      setOpen(true)
      fetchSuggestions(query)
    }
  }

  function selectTag(tag: Hashtag) {
    if (value.length >= maxTags) return
    if (value.some(v => v.id === tag.id)) return
    onChange([...value, tag])
    setQuery('')
    setSuggestions(prev => prev.filter(s => s.id !== tag.id))
    inputRef.current?.focus()
  }

  async function handleCreate() {
    const name = query.trim().replace(/^#/, '')
    if (!name || value.length >= maxTags) return
    setLoading(true)
    const result = await createHashtag(name)
    setLoading(false)
    if (result.data) {
      selectTag(result.data)
    }
  }

  function removeTag(id: string) {
    onChange(value.filter(t => t.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const exact = suggestions.find(s => s.name === query.toLowerCase().replace(/^#/, ''))
      if (exact) selectTag(exact)
      else if (query.trim()) handleCreate()
    }
    if (e.key === 'Backspace' && !query && value.length > 0) {
      onChange(value.slice(0, -1))
    }
    if (e.key === 'Escape') setOpen(false)
  }

  const atMax = value.length >= maxTags
  const showCreate = query.trim() && !suggestions.some(s => s.name === query.toLowerCase().replace(/^#/, ''))

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`min-h-[42px] flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl bg-[#1f1f20] border ${open ? 'border-[#2563eb]/60' : 'border-[rgba(229,231,235,0.08)]'} transition-colors cursor-text`}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(tag => (
          <span key={tag.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2563eb]/15 border border-[#2563eb]/30 text-[#2563eb] text-xs font-medium">
            #{tag.name}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeTag(tag.id) }}
              className="hover:text-anchor-graphite transition-colors ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {!atMax && (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value.replace(/\s/g, ''))}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? '#etiket ekle...' : ''}
            className="flex-1 min-w-[120px] bg-transparent text-[#ffffff] text-sm placeholder:text-[#999999] outline-none"
          />
        )}

        {atMax && (
          <span className="text-[#999999] text-xs ml-1">Maksimum {maxTags} etiket</span>
        )}
      </div>

      {open && !atMax && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-[#999999]" />
            </div>
          )}

          {!loading && suggestions.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
            >
              <Hash className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
              <span className="text-[#ffffff] text-sm">#{tag.name}</span>
              <span className="text-[#999999] text-xs ml-auto">{tag.post_count}</span>
            </button>
          ))}

          {!loading && showCreate && (
            <button
              type="button"
              onClick={handleCreate}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left border-t border-[rgba(255,255,255,0.06)]"
            >
              <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[#999999] text-sm">
                Yeni oluştur: <span className="text-primary font-medium">#{query.replace(/^#/, '')}</span>
              </span>
            </button>
          )}

          {!loading && suggestions.length === 0 && !showCreate && (
            <p className="text-[#999999] text-xs text-center py-4"># yazarak etiket ara veya oluştur</p>
          )}
        </div>
      )}
    </div>
  )
}
