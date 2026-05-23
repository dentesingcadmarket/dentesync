'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Loader2, Lock, Plus, Compass } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  getPosts, deletePost, toggleLike,
  getLikedPostIds,
  savePost, unsavePost, getSavedPostIds,
} from '@/app/actions/community'
import { SearchBar } from '@/components/dashboard/community/search-bar'
import { NotificationPanel } from '@/components/dashboard/community/notification-panel'
import { PostTypeSelector } from '@/components/dashboard/community/post-type-selector'
import { PostFormRouter, type PostWithProfile } from '@/components/dashboard/community/post-forms'
import { PostCard } from '@/components/dashboard/community/post-card'
import type { PostType } from '@/lib/supabase/types'

const POST_TYPE_LABELS: Record<PostType, string> = {
  consultation: 'Danışma',
  error_solution: 'Hata Çözümü',
  material_review: 'Materyal',
  step_by_step: 'Süreç',
  showcase: 'Showcase',
  critique_request: 'Kritik İste',
}

const POST_TYPES: PostType[] = [
  'consultation', 'error_solution', 'material_review',
  'step_by_step', 'showcase', 'critique_request',
]

interface Props {
  canWrite: boolean
  currentUserId: string
  currentUsername: string
  initialPosts: PostWithProfile[]
  initialLikedIds: string[]
  initialSavedIds: string[]
  initialUnreadCount: number
}

export function CommunityWrapper({
  canWrite,
  currentUserId,
  currentUsername,
  initialPosts,
  initialLikedIds,
  initialSavedIds,
  initialUnreadCount,
}: Props) {
  const router = useRouter()
  const [posts, setPosts] = useState<PostWithProfile[]>(initialPosts)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds))
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds))
  const pageRef = useRef(0)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // Filtre state
  const [typeFilter, setTypeFilter] = useState<PostType | null>(null)
  const [filterLoading, setFilterLoading] = useState(false)

  // Compose state
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedType, setSelectedType] = useState<PostType | null>(null)

  // Filtre uygulandığında postları yeniden yükle
  async function applyFilters(type: PostType | null) {
    setFilterLoading(true)
    pageRef.current = 0
    const result = await getPosts({
      page: 0,
      post_type: type ?? undefined,
    })
    const newPosts = (result.data ?? []) as PostWithProfile[]
    setPosts(newPosts)
    setHasMore(newPosts.length === 20)
    if (newPosts.length) {
      const [ids, sIds] = await Promise.all([
        getLikedPostIds(newPosts.map(p => p.id)),
        getSavedPostIds(newPosts.map(p => p.id)),
      ])
      setLikedIds(new Set(ids))
      setSavedIds(new Set(sIds))
    }
    setFilterLoading(false)
  }

  function handleTypeFilter(type: PostType | null) {
    const next = type === typeFilter ? null : type
    setTypeFilter(next)
    applyFilters(next)
  }

  const loadMore = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    const nextPage = pageRef.current + 1
    const result = await getPosts({
      page: nextPage,
      post_type: typeFilter ?? undefined,
    })
    const newPosts = (result.data ?? []) as PostWithProfile[]
    if (!newPosts.length) { setHasMore(false); setLoadingMore(false); return }
    setPosts(prev => [...prev, ...newPosts])
    setHasMore(newPosts.length === 20)
    pageRef.current = nextPage
    const [ids, sIds] = await Promise.all([
      getLikedPostIds(newPosts.map(p => p.id)),
      getSavedPostIds(newPosts.map(p => p.id)),
    ])
    setLikedIds(prev => new Set([...prev, ...ids]))
    setSavedIds(prev => new Set([...prev, ...sIds]))
    setLoadingMore(false)
  }, [loadingMore, typeFilter])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore])

  // Realtime
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel('community_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' },
        async (payload: { new: { id: string } }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any)
            .from('community_posts')
            .select('*, profiles(username, full_name, avatar_url, subscription_tier, posts_count)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setPosts(prev => {
              if (prev.find(p => p.id === data.id)) return prev
              return [data as PostWithProfile, ...prev]
            })
          }
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload: { old: { id: string } }) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload: { new: { id: string; likes: number; comment_count: number } }) => {
          setPosts(prev => prev.map(p =>
            p.id === payload.new.id ? { ...p, likes: payload.new.likes, comment_count: payload.new.comment_count } : p
          ))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePostCreated(post: PostWithProfile) {
    setPosts(prev => [post, ...prev.filter(p => p.id !== post.id)])
    setShowTypeSelector(false)
    setSelectedType(null)
    router.refresh()
  }

  function handleCommentAdded(postId: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p
    ))
  }

  async function handleDelete(postId: string) {
    const result = await deletePost(postId)
    if (result.error) { toast.error(result.error); return }
    setPosts(prev => prev.filter(p => p.id !== postId))
    toast.success('Gönderi silindi.')
    router.refresh()
  }

  async function handleLike(postId: string) {
    const result = await toggleLike(postId)
    if (result.error) { toast.error(result.error); return }
    if (result.liked !== undefined) {
      setLikedIds(prev => {
        const n = new Set(prev)
        if (result.liked) n.add(postId)
        else n.delete(postId)
        return n
      })
    }
    if (result.likes !== undefined) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: result.likes! } : p))
    }
  }

  async function handleSave(postId: string, isSaved: boolean) {
    const result = isSaved ? await unsavePost(postId) : await savePost(postId)
    if (result.error) { toast.error(result.error); return }
    setSavedIds(prev => {
      const n = new Set(prev)
      if (isSaved) n.delete(postId)
      else n.add(postId)
      return n
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#000000]/95 backdrop-blur-sm px-3 sm:px-6 lg:px-8 pt-3 pb-3 space-y-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-[#2dd4bf]" />
            </div>
            <h1 className="text-base font-semibold text-[#ffffff]">Topluluk</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationPanel currentUserId={currentUserId} initialUnreadCount={initialUnreadCount} />

            <Link href="/dashboard/community/explore"
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] hover:text-[#ffffff] hover:bg-white/5 transition-colors">
              <Compass className="w-4 h-4" />
            </Link>

            <Link
              href={currentUsername ? `/dashboard/community/profile/${currentUsername}` : '/dashboard/community/profile/me'}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] text-xs hover:text-[#ffffff] hover:bg-white/5 transition-colors"
            >
              @{currentUsername || 'profil'}
            </Link>

            {canWrite ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowTypeSelector(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-sm font-semibold cursor-pointer hover:bg-[#5eead4] transition-colors shadow-[0_0_18px_rgba(45,212,191,0.18)]">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Paylaş</span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] text-xs">
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">M2+</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <SearchBar />

        {/* Tip filtresi */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => handleTypeFilter(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              typeFilter === null
                ? 'bg-[#2dd4bf] text-[#0a0a0a] border-[#2dd4bf]'
                : 'bg-transparent text-[#999999] border-[rgba(255,255,255,0.08)] hover:text-[#ffffff]'
            }`}
          >
            Tümü
          </button>
          {POST_TYPES.map(t => (
            <button
              key={t}
              onClick={() => handleTypeFilter(t)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                typeFilter === t
                  ? 'bg-[#2dd4bf] text-[#0a0a0a] border-[#2dd4bf]'
                  : 'bg-transparent text-[#999999] border-[rgba(255,255,255,0.08)] hover:text-[#ffffff]'
              }`}
            >
              {POST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

      </div>

      {/* Feed */}
      <div className="px-3 sm:px-6 lg:px-8 pb-8 pt-4 space-y-3">
        {/* Modals */}
        <AnimatePresence>
          {showTypeSelector && !selectedType && (
            <PostTypeSelector
              onSelect={type => { setSelectedType(type); setShowTypeSelector(false) }}
              onClose={() => setShowTypeSelector(false)}
            />
          )}
          {selectedType && (
            <PostFormRouter
              type={selectedType}
              onCreated={handlePostCreated}
              onClose={() => setSelectedType(null)}
            />
          )}
        </AnimatePresence>

        {filterLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#999999]" />
          </div>
        )}

        {!filterLoading && posts.length === 0 && (
          <div className="text-center py-16 text-[#999999]">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {typeFilter
                ? 'Bu filtreyle eşleşen gönderi yok.'
                : 'Henüz gönderi yok. İlk paylaşımı sen yap!'
              }
            </p>
          </div>
        )}

        {!filterLoading && posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i < 5 ? i * 0.04 : 0 }}
          >
            <PostCard
              post={post}
              canWrite={canWrite}
              currentUserId={currentUserId}
              likedByMe={likedIds.has(post.id)}
              savedByMe={savedIds.has(post.id)}
              onDelete={handleDelete}
              onLike={handleLike}
              onSave={handleSave}
              onCommentAdded={handleCommentAdded}
            />
          </motion.div>
        ))}

        <div ref={sentinelRef} className="h-4 flex items-center justify-center">
          {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />}
        </div>
      </div>
    </div>
  )
}
