'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Heart, MessageCircle, ImageIcon, Send, Trash2,
  Loader2, ChevronDown, Lock, X, Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  getPosts, createPost, deletePost, toggleLike,
  getComments, createComment,
} from '@/app/actions/community'
import type { CommunityPost, CommunityComment, Profile } from '@/lib/supabase/types'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}
type CommentWithProfile = CommunityComment & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

interface Props {
  canWrite: boolean
  currentUserId: string
  initialPosts: PostWithProfile[]
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
    <div className={`${dim} rounded-full bg-[#2563eb]/20 flex items-center justify-center text-[#2563eb] font-semibold shrink-0`}>
      {initials}
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m}dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa önce`
  const d = Math.floor(h / 24)
  return `${d}g önce`
}

export function CommunityWrapper({ canWrite, currentUserId, initialPosts }: Props) {
  const [posts, setPosts] = useState<PostWithProfile[]>(initialPosts)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const supabase = createClient()

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    const nextPage = page + 1
    const result = await getPosts(nextPage)
    if (result.data) {
      setPosts(prev => [...prev, ...(result.data as PostWithProfile[])])
      setHasMore(result.data.length === 20)
      setPage(nextPage)
    }
    setLoadingMore(false)
  }, [page])

  useEffect(() => {
    const channel = supabase
      .channel('community_posts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        async (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const db = supabase as any
          const { data } = await db
            .from('community_posts')
            .select('*, profiles(username, full_name, avatar_url)')
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
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setPosts(prev => prev.map(p =>
            p.id === payload.new.id ? { ...p, likes: payload.new.likes } : p
          ))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  function handlePostCreated(post: PostWithProfile) {
    setPosts(prev => [post, ...prev.filter(p => p.id !== post.id)])
    setShowCompose(false)
  }

  async function handleDelete(postId: string) {
    const result = await deletePost(postId)
    if (result.error) { toast.error(result.error); return }
    setPosts(prev => prev.filter(p => p.id !== postId))
    toast.success('Gönderi silindi.')
  }

  async function handleLike(postId: string) {
    await toggleLike(postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes ?? 0) + 1 } : p))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#f4f4f5]">Topluluk</h1>
            <p className="text-[#71717a] text-sm">Diş teknisyenleri topluluğu</p>
          </div>
        </div>

        {canWrite ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Paylaş
          </motion.button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-xs">
            <Lock className="w-3 h-3" />
            M2+ yazma
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            onClose={() => setShowCompose(false)}
            onCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="text-center py-16 text-[#71717a]">
            <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Henüz gönderi yok. İlk paylaşımı sen yap!</p>
          </div>
        )}
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i < 5 ? i * 0.05 : 0 }}
          >
            <PostCard
              post={post}
              canWrite={canWrite}
              currentUserId={currentUserId}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:text-[#f4f4f5] hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
            Daha fazla yükle
          </button>
        </div>
      )}
    </div>
  )
}

function PostCard({
  post, canWrite, currentUserId, onDelete, onLike,
}: {
  post: PostWithProfile
  canWrite: boolean
  currentUserId: string
  onDelete: (id: string) => void
  onLike: (id: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, startSubmit] = useTransition()

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
    })
  }

  return (
    <div className="p-5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
      <div className="flex items-start gap-3 mb-3">
        <Avatar profile={post.profiles} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#f4f4f5] text-sm font-medium">
              {post.profiles?.full_name || post.profiles?.username || 'Kullanıcı'}
            </span>
            <span className="text-[#71717a] text-xs">{timeAgo(post.created_at)}</span>
          </div>
          <p className="text-[#71717a] text-xs">@{post.profiles?.username ?? '—'}</p>
        </div>
        {post.user_id === currentUserId && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {post.content && (
        <p className="text-[#f4f4f5] text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      )}

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt="Gönderi görseli"
          className="w-full rounded-xl mb-3 max-h-80 object-cover border border-[rgba(255,255,255,0.07)]"
        />
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-[rgba(255,255,255,0.05)]">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-1.5 text-[#71717a] hover:text-red-400 transition-colors text-sm"
        >
          <Heart className="w-4 h-4" />
          <span>{post.likes ?? 0}</span>
        </button>
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 text-[#71717a] hover:text-[#2563eb] transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length > 0 ? comments.length : 'Yorumlar'}</span>
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <Avatar profile={c.profiles} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#f4f4f5] text-xs font-medium">
                        {c.profiles?.full_name || c.profiles?.username || 'Kullanıcı'}
                      </span>
                      <span className="text-[#71717a] text-xs">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-[#71717a] text-sm mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}

              {canWrite ? (
                <form onSubmit={handleComment} className="flex items-center gap-2 pt-1">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Yorum yaz..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] text-sm focus:outline-none focus:border-[#2563eb] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim()}
                    className="p-2 rounded-xl bg-[#2563eb] text-white disabled:opacity-40 transition-opacity cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-[#71717a] text-xs pt-1">
                  <Lock className="w-3 h-3" />
                  Yorum yazmak için M2+ planı gerekiyor
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ComposeModal({ onClose, onCreated }: {
  onClose: () => void
  onCreated: (post: PostWithProfile) => void
}) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, startSubmit] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Görsel maksimum 5MB olabilir.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !imageFile) { toast.error('İçerik veya görsel ekleyin.'); return }

    startSubmit(async () => {
      let imageUrl: string | undefined
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const res = await fetch('/api/community/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || 'Görsel yüklenemedi.'); return }
        imageUrl = data.url
      }

      const result = await createPost(content, imageUrl)
      if (result.error) { toast.error(result.error); return }
      toast.success('Gönderi paylaşıldı!')
      onCreated(result.data as PostWithProfile)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-lg bg-[#111114] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
          <p className="text-[#f4f4f5] font-medium">Yeni Gönderi</p>
          <button onClick={onClose} className="text-[#71717a] hover:text-[#f4f4f5] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Ne paylaşmak istiyorsunuz?"
            rows={4}
            maxLength={1000}
            className="w-full px-4 py-3 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] text-sm resize-none focus:outline-none focus:border-[#2563eb] transition-colors"
          />

          {imagePreview && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Önizleme" className="w-full rounded-xl max-h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.07)] text-[#71717a] text-xs hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Görsel
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <span className="text-[#71717a] text-xs">{content.length}/1000</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:bg-white/5 transition-colors"
              >
                İptal
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || (!content.trim() && !imageFile)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Paylaş
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
