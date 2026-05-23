'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Hash, User, FileText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { CommunityPost, Profile, Hashtag } from '@/lib/supabase/types'

type SearchResults = {
  posts?: (CommunityPost & { profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null })[]
  users?: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'bio'>[]
  hashtags?: Pick<Hashtag, 'id' | 'name' | 'post_count'>[]
}

type TabType = 'all' | 'posts' | 'users' | 'hashtags'

interface Props {
  placeholder?: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m}dk`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa`
  return `${Math.floor(h / 24)}g`
}

export function SearchBar({ placeholder = 'Kullanıcı, hashtag veya konu ara...' }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [results, setResults] = useState<SearchResults>({})
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string, tab: TabType) => {
    if (q.length < 2) { setResults({}); setOpen(false); return }
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    try {
      const res = await fetch(
        `/api/community/search?q=${encodeURIComponent(q)}&type=${tab}`,
        { signal: abortRef.current.signal }
      )
      if (!res.ok) return
      const data = await res.json()
      setResults(data)
      setOpen(true)
    } catch {
      // aborted
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query, activeTab), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, activeTab, search])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function clear() {
    setQuery('')
    setResults({})
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab)
  }

  const hasResults = (results.posts?.length ?? 0) + (results.users?.length ?? 0) + (results.hashtags?.length ?? 0) > 0
  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'Tümü' },
    { id: 'posts', label: 'Gönderiler' },
    { id: 'users', label: 'Kullanıcılar' },
    { id: 'hashtags', label: 'Etiketler' },
  ]

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (query.length >= 2 && hasResults) setOpen(true) }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf]/60 transition-colors"
        />
        {(query || loading) && (
          <button
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#ffffff] transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[rgba(255,255,255,0.06)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#2dd4bf] border-b-2 border-[#2dd4bf]'
                    : 'text-[#999999] hover:text-[#ffffff]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!hasResults && !loading && (
              <p className="text-[#999999] text-sm text-center py-6">Sonuç bulunamadı.</p>
            )}

            {/* Gönderiler */}
            {(activeTab === 'all' || activeTab === 'posts') && (results.posts?.length ?? 0) > 0 && (
              <div>
                {activeTab === 'all' && (
                  <p className="px-4 pt-3 pb-1 text-[10px] text-[#999999] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Gönderiler
                  </p>
                )}
                {results.posts!.map(post => (
                  <button
                    key={post.id}
                    onClick={() => { router.push(`/dashboard/community?post=${post.id}`); setOpen(false) }}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-[#999999] mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[#ffffff] text-sm truncate">
                        {post.content?.slice(0, 80) || '[Görsel]'}
                      </p>
                      <p className="text-[#999999] text-xs mt-0.5">
                        @{post.profiles?.username || '—'} · {timeAgo(post.created_at)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Kullanıcılar */}
            {(activeTab === 'all' || activeTab === 'users') && (results.users?.length ?? 0) > 0 && (
              <div>
                {activeTab === 'all' && (
                  <p className="px-4 pt-3 pb-1 text-[10px] text-[#999999] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Kullanıcılar
                  </p>
                )}
                {results.users!.map(user => (
                  <button
                    key={user.id}
                    onClick={() => { router.push(`/dashboard/community/profile/${user.username}`); setOpen(false) }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-xs font-semibold shrink-0 overflow-hidden">
                      {user.avatar_url
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        : (user.full_name || user.username || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[#ffffff] text-sm font-medium truncate">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-[#999999] text-xs">@{user.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Hashtagler */}
            {(activeTab === 'all' || activeTab === 'hashtags') && (results.hashtags?.length ?? 0) > 0 && (
              <div>
                {activeTab === 'all' && (
                  <p className="px-4 pt-3 pb-1 text-[10px] text-[#999999] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Etiketler
                  </p>
                )}
                {results.hashtags!.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => { router.push(`/dashboard/community/hashtag/${tag.name}`); setOpen(false) }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center shrink-0">
                      <Hash className="w-4 h-4 text-[#2dd4bf]" />
                    </div>
                    <div>
                      <p className="text-[#ffffff] text-sm font-medium">#{tag.name}</p>
                      <p className="text-[#999999] text-xs">{tag.post_count} gönderi</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
