'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash, ArrowLeft, Heart, MessageCircle, Bookmark, MoreHorizontal,
  Send, Loader2, Lock, Trash2, Share2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  getHashtagFeed, toggleLike, getLikedPostIds, getSavedPostIds,
  savePost, unsavePost, getComments, createComment, deletePost,
} from '@/app/actions/community'
import type { CommunityPost, CommunityComment, Profile } from '@/lib/supabase/types'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}
type CommentWithProfile = CommunityComment & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m}dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa önce`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}g önce`
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

function Avatar({ profile, size = 'sm' }: {
  profile: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
  size?: 'sm' | 'md'
}) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  const initials = (profile?.full_name || profile?.username || '?').charAt(0).toUpperCase()
  if (profile?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatar_url} alt={initials} className={`${dim} rounded-full object-cover shrink-0`} />
  }
  return (
    <div className={`${dim} rounded-full shrink-0 bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] font-semibold`}>
      {initials}
    </div>
  )
}

function renderContent(content: string) {
  const parts = content.split(/(#[a-zA-ZğüşıöçĞÜŞİÖÇ0-9_]{2,30})/g)
  return parts.map((part, i) =>
    part.startsWith('#')
      ? <Link key={i} href={`/dashboard/community/hashtag/${part.slice(1).toLowerCase()}`}
          className="text-[#2dd4bf] hover:underline">{part}</Link>
      : <span key={i}>{part}</span>
  )
}

function PostCard({
  post, currentUserId, canWrite, likedByMe, savedByMe, onLike, onSave, onDelete,
}: {
  post: PostWithProfile
  currentUserId: string
  canWrite: boolean
  likedByMe: boolean
  savedByMe: boolean
  onLike: (id: string) => void
  onSave: (id: string, saved: boolean) => void
  onDelete: (id: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, startSubmit] = useTransition()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  async function loadComments() {
    if (commentsLoaded) { setShowComments(p => !p); return }
    const result = await getComments(post.id)
    if (result.data) { setComments(result.data as CommentWithProfile[]); setCommentsLoaded(true) }
    setShowComments(true)
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    startSubmit(async () => {
      const result = await createComment(post.id, commentText)
      if (result.error) { toast.error(result.error); return }
      setComments(prev => [...prev, result.data as CommentWithProfile])
      setCommentText('')
      if (!commentsLoaded) setCommentsLoaded(true)
      if (!showComments) setShowComments(true)
    })
  }

  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/community?post=${post.id}`)
    toast.success('Link kopyalandı')
    setShowMenu(false)
  }

  const commentCount = post.comment_count ?? (commentsLoaded ? comments.length : 0)

  return (
    <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.10)] transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <Avatar profile={post.profiles} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/dashboard/community/profile/${post.profiles?.username}`}
              className="text-[#ffffff] text-sm font-medium hover:underline">
              {post.profiles?.full_name || post.profiles?.username || 'Kullanıcı'}
            </Link>
            <span className="text-[#999999] text-xs">{timeAgo(post.created_at)}</span>
          </div>
          <p className="text-[#999999] text-xs">@{post.profiles?.username ?? '—'}</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(p => !p)}
            className="p-1.5 rounded-lg text-[#999999] hover:text-[#ffffff] hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-1 z-40 w-40 bg-[#1f1f20] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden"
              >
                <button onClick={handleShare} className="w-full flex items-center gap-2 px-3 py-2.5 text-[#ffffff] text-sm hover:bg-white/5 transition-colors">
                  <Share2 className="w-3.5 h-3.5 text-[#999999]" /> Paylaş
                </button>
                {canWrite && (
                  <button onClick={() => { onSave(post.id, savedByMe); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[#ffffff] text-sm hover:bg-white/5 transition-colors">
                    <Bookmark className={`w-3.5 h-3.5 ${savedByMe ? 'text-[#2dd4bf] fill-[#2dd4bf]' : 'text-[#999999]'}`} />
                    {savedByMe ? 'Kayıttan Çıkar' : 'Kaydet'}
                  </button>
                )}
                <button onClick={() => { toast.info('Bildiriminiz alındı.'); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[#ffffff] text-sm hover:bg-white/5 transition-colors">
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-[#999999] text-[10px]">!</span> Rapor Et
                </button>
                {post.user_id === currentUserId && (
                  <button onClick={() => { onDelete(post.id); setShowMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-anchor-graphite text-sm hover:bg-anchor-graphite/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Sil
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {post.content && (
        <p className="text-[#ffffff] text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {renderContent(post.content)}
        </p>
      )}

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="Gönderi görseli" loading="lazy" decoding="async"
          className="w-full rounded-xl mb-3 max-h-80 object-cover border border-[rgba(229,231,235,0.08)]" />
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
        <motion.button onClick={() => onLike(post.id)} whileTap={{ scale: 0.85 }}
          className={`flex items-center gap-1.5 text-sm transition-colors ${likedByMe ? 'text-anchor-graphite' : 'text-[#999999] hover:text-anchor-graphite'}`}>
          <Heart className={`w-4 h-4 transition-all ${likedByMe ? 'fill-anchor-graphite' : ''}`} />
          <span>{post.likes ?? 0}</span>
        </motion.button>
        <button onClick={loadComments} className="flex items-center gap-1.5 text-[#999999] hover:text-[#2dd4bf] transition-colors text-sm">
          <MessageCircle className="w-4 h-4" />
          <span>{commentCount > 0 ? commentCount : 'Yorum'}</span>
        </button>
        <motion.button onClick={() => onSave(post.id, savedByMe)} whileTap={{ scale: 0.85 }}
          className={`flex items-center gap-1.5 text-sm transition-colors ml-auto ${savedByMe ? 'text-[#2dd4bf]' : 'text-[#999999] hover:text-[#2dd4bf]'}`}>
          <Bookmark className={`w-4 h-4 ${savedByMe ? 'fill-[#2dd4bf]' : ''}`} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] space-y-3">
              {comments.length === 0 && <p className="text-[#999999] text-xs text-center py-2">Henüz yorum yok.</p>}
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <Avatar profile={c.profiles} />
                  <div className="flex-1 min-w-0 bg-[#1f1f20] rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#ffffff] text-xs font-medium">{c.profiles?.full_name || c.profiles?.username || 'Kullanıcı'}</span>
                      <span className="text-[#999999] text-[10px]">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-[#999999] text-sm mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
              {canWrite ? (
                <form onSubmit={handleComment} className="flex items-center gap-2 pt-1">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Yorum yaz..." maxLength={500}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors" />
                  <button type="submit" disabled={isSubmitting || !commentText.trim()}
                    className="p-2 rounded-xl bg-[#2dd4bf] text-white disabled:opacity-40 transition-opacity cursor-pointer">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-[#999999] text-xs pt-1">
                  <Lock className="w-3 h-3" /> Yorum yazmak için M2+ planı gerekiyor
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface HashtagPageProps {
  tag: string
  totalCount: number
  initialPosts: PostWithProfile[]
  currentUserId: string
  canWrite: boolean
  initialLikedIds: string[]
  initialSavedIds: string[]
}

export function HashtagPageClient({
  tag, totalCount, initialPosts, currentUserId, canWrite, initialLikedIds, initialSavedIds,
}: HashtagPageProps) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds))
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedIds))
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)
  const pageRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loadingMore) return
    setLoadingMore(true)
    const nextPage = pageRef.current + 1
    const result = await getHashtagFeed(tag, nextPage)
    if (result.data) {
      const newPosts = result.data as PostWithProfile[]
      if (!newPosts.length) { setHasMore(false); setLoadingMore(false); return }
      setPosts(prev => [...prev, ...newPosts])
      setHasMore(newPosts.length === 20)
      pageRef.current = nextPage
      const ids = await getLikedPostIds(newPosts.map(p => p.id))
      setLikedIds(prev => new Set([...prev, ...ids]))
      const sIds = await getSavedPostIds(newPosts.map(p => p.id))
      setSavedIds(prev => new Set([...prev, ...sIds]))
    }
    setLoadingMore(false)
  }, [loadingMore, tag])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore])

  async function handleLike(postId: string) {
    const result = await toggleLike(postId)
    if (result.error) { toast.error(result.error); return }
    if (result.liked !== undefined) {
      setLikedIds(prev => { const n = new Set(prev); if (result.liked) { n.add(postId) } else { n.delete(postId) }; return n })
    }
    if (result.likes !== undefined) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: result.likes! } : p))
    }
  }

  async function handleSave(postId: string, isSaved: boolean) {
    if (!canWrite) { toast.error('Kaydetmek için M2+ planı gerekiyor.'); return }
    const result = isSaved ? await unsavePost(postId) : await savePost(postId)
    if (result.error) { toast.error(result.error); return }
    setSavedIds(prev => { const n = new Set(prev); if (isSaved) { n.delete(postId) } else { n.add(postId) }; return n })
    toast.success(isSaved ? 'Kaydedilenlerden çıkarıldı.' : 'Kaydedildi.')
  }

  async function handleDelete(postId: string) {
    const result = await deletePost(postId)
    if (result.error) { toast.error(result.error); return }
    setPosts(prev => prev.filter(p => p.id !== postId))
    toast.success('Gönderi silindi.')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] hover:text-[#ffffff] hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-[#2dd4bf]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#ffffff]">#{tag}</h1>
            <p className="text-[#999999] text-sm">{totalCount} gönderi</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-center py-16 text-[#999999]">
            <Hash className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Bu etikete ait gönderi bulunamadı.</p>
          </div>
        )}
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i < 5 ? i * 0.05 : 0 }}>
            <PostCard
              post={post}
              currentUserId={currentUserId}
              canWrite={canWrite}
              likedByMe={likedIds.has(post.id)}
              savedByMe={savedIds.has(post.id)}
              onLike={handleLike}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </motion.div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-4 flex items-center justify-center">
        {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />}
      </div>
    </div>
  )
}
