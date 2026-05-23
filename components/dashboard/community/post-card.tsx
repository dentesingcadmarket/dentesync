'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Bookmark, Trash2, Star, ChevronDown, ChevronUp, MessageCircle, Eye, Box } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CommentSection } from './comment-section'
import { ImageLightbox } from './image-lightbox'
import type { PostType, CommunityPost, Profile } from '@/lib/supabase/types'

export type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'subscription_tier' | 'posts_count'> | null
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

function PostTypeBadge({ type }: { type: PostType }) {
  const map: Record<PostType, { label: string; cls: string }> = {
    consultation: { label: 'DANIŞMA', cls: 'bg-anchor-graphite0/20 text-anchor-graphite border-anchor-graphite0/30' },
    error_solution: { label: 'HATA → ÇÖZÜM', cls: 'bg-anchor-graphite0/20 text-anchor-graphite border-anchor-graphite0/30' },
    material_review: { label: 'MATERYAL DEĞERLENDİRME', cls: 'bg-primary0/20 text-primary border-primary0/30' },
    step_by_step: { label: 'SÜREÇ', cls: 'bg-primary0/20 text-primary border-primary0/30' },
    showcase: { label: 'SHOWCASE', cls: 'bg-white/10 text-[#999999] border-white/10' },
    critique_request: { label: 'KRİTİK İSTE', cls: 'bg-primary0/20 text-primary border-primary0/30' },
  }
  const { label, cls } = map[type] ?? map.showcase
  return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>
}

function StarsDisplay({ ratings }: { ratings: Record<string, number> }) {
  const criteria = [
    { key: 'islenebilirlik', label: 'İşlenebilirlik' },
    { key: 'estetik', label: 'Estetik' },
    { key: 'dayaniklarlik', label: 'Dayanıklılık' },
  ]
  return (
    <div className="space-y-1.5">
      {criteria.map(c => (
        <div key={c.key} className="flex items-center justify-between">
          <span className="text-xs text-[#999999]">{c.label}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} className={`w-3 h-3 ${n <= (ratings[c.key] ?? 0) ? 'text-muted-silver fill-muted-silver' : 'text-[#404040]'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StlDownloadLink({ post }: { post: PostWithProfile }) {
  const stlUrl = post.metadata?.stl_url as string | undefined
  if (!stlUrl) return null
  return (
    <a href={stlUrl}
      download={(post.metadata?.stl_filename as string) || 'model.stl'}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(255,255,255,0.08)] text-[#999999] text-xs hover:border-[#2dd4bf]/40 hover:text-[#2dd4bf] transition-colors">
      <Box className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0" />
      {(post.metadata?.stl_filename as string) || 'STL Dosyasını İndir'}
    </a>
  )
}

function PostCardBody({ post, onOpenComments, onImageClick }: { post: PostWithProfile; onOpenComments: () => void; onImageClick: (src: string) => void }) {
  const [stepsOpen, setStepsOpen] = useState(false)

  switch (post.post_type) {
    case 'consultation':
      return (
        <div className="space-y-3">
          {post.title && <h3 className="text-[#ffffff] font-semibold text-base leading-snug">{post.title}</h3>}
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="" loading="lazy"
              onClick={() => onImageClick(post.image_url!)}
              className="w-full max-h-72 object-cover rounded-xl border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
          )}
          {post.content && <p className="text-[#999999] text-sm leading-relaxed">{post.content}</p>}
          <StlDownloadLink post={post} />
          <button onClick={onOpenComments}
            className="flex items-center gap-2 w-full justify-center py-2 rounded-xl bg-anchor-graphite0/10 border border-anchor-graphite0/20 text-anchor-graphite text-sm font-medium hover:bg-anchor-graphite0/15 transition-colors">
            <MessageCircle className="w-4 h-4" /> Yanıtla
          </button>
        </div>
      )

    case 'error_solution': {
      const solution = post.metadata?.solution as string | undefined
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-anchor-graphite0/5 border border-anchor-graphite0/20">
              <p className="text-[9px] font-bold text-anchor-graphite mb-1.5">PROBLEM</p>
              <p className="text-[#999999] text-xs leading-relaxed">{post.content}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary0/5 border border-primary0/20">
              <p className="text-[9px] font-bold text-primary mb-1.5">ÇÖZÜM</p>
              <p className="text-[#999999] text-xs leading-relaxed">{solution ?? '—'}</p>
            </div>
          </div>
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="" loading="lazy"
              onClick={() => onImageClick(post.image_url!)}
              className="w-full max-h-48 object-cover rounded-xl border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
          )}
          <StlDownloadLink post={post} />
        </div>
      )
    }

    case 'material_review': {
      const ratings = post.metadata?.ratings as Record<string, number> | undefined
      const brand = post.metadata?.brand as string | undefined
      const usageArea = post.metadata?.usage_area as string | undefined
      return (
        <div className="space-y-3">
          <div>
            {post.title && <h3 className="text-[#ffffff] font-semibold">{post.title}</h3>}
            {(brand || usageArea) && (
              <p className="text-[#999999] text-xs mt-0.5">{[brand, usageArea].filter(Boolean).join(' · ')}</p>
            )}
          </div>
          {ratings && <StarsDisplay ratings={ratings} />}
          {post.content && <p className="text-[#999999] text-sm leading-relaxed">{post.content}</p>}
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="" loading="lazy"
              onClick={() => onImageClick(post.image_url!)}
              className="w-full max-h-48 object-cover rounded-xl border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
          )}
          <StlDownloadLink post={post} />
        </div>
      )
    }

    case 'step_by_step': {
      const steps = post.metadata?.steps as { step: number; description: string; image_url?: string }[] | undefined
      return (
        <div className="space-y-3">
          {post.title && <h3 className="text-[#ffffff] font-semibold">{post.title}</h3>}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary0/10 px-2.5 py-1 rounded-full border border-primary0/20">
              {steps?.length ?? 0} adım
            </span>
            {steps?.[0] && <p className="text-[#999999] text-xs truncate">{steps[0].description}</p>}
          </div>
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="Sonuç" loading="lazy"
              onClick={() => onImageClick(post.image_url!)}
              className="w-full max-h-56 object-cover rounded-xl border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
          )}
          <StlDownloadLink post={post} />
          {steps && steps.length > 0 && (
            <>
              <button
                onClick={() => setStepsOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs text-[#2dd4bf] hover:text-[#2dd4bf] transition-colors"
              >
                {stepsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {stepsOpen ? 'Adımları gizle' : 'Tüm adımları gör'}
              </button>
              {stepsOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {steps.map(s => (
                    <div key={s.step} className="flex gap-3 p-2.5 rounded-lg bg-[#161617] border border-[rgba(255,255,255,0.05)]">
                      <span className="w-5 h-5 rounded-full bg-primary0/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{s.step}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#999999] text-xs">{s.description}</p>
                        {s.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.image_url} alt="" loading="lazy"
                            onClick={() => onImageClick(s.image_url!)}
                            className="mt-1.5 w-full max-h-32 object-cover rounded-lg border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      )
    }

    case 'showcase':
      return (
        <div className="space-y-2">
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="" loading="lazy"
              onClick={() => onImageClick(post.image_url!)}
              className="w-full max-h-80 object-cover rounded-xl border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
          )}
          {post.content && <p className="text-[#999999] text-sm">{post.content}</p>}
          {(post.metadata?.technicalDetails as string | undefined) && (
            <p className="text-[#999999] text-xs">{post.metadata!.technicalDetails as string}</p>
          )}
          <StlDownloadLink post={post} />
        </div>
      )

    case 'critique_request':
      return (
        <div className="space-y-3">
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt="" loading="lazy"
              onClick={() => onImageClick(post.image_url!)}
              className="w-full max-h-72 object-cover rounded-xl border border-[rgba(229,231,235,0.08)] cursor-zoom-in" />
          )}
          {post.content && <p className="text-[#999999] text-sm leading-relaxed">{post.content}</p>}
          <StlDownloadLink post={post} />
          <button onClick={onOpenComments}
            className="flex items-center gap-2 w-full justify-center py-2 rounded-xl bg-primary0/10 border border-primary0/20 text-primary text-sm font-medium hover:bg-primary0/15 transition-colors">
            <Eye className="w-4 h-4" /> Bu vakayı değerlendir
          </button>
        </div>
      )

    default:
      return post.content ? <p className="text-[#999999] text-sm">{post.content}</p> : null
  }
}

interface PostCardProps {
  post: PostWithProfile
  canWrite: boolean
  currentUserId: string
  likedByMe: boolean
  savedByMe: boolean
  onDelete: (id: string) => void
  onLike: (id: string) => Promise<void>
  onSave: (id: string, isSaved: boolean) => Promise<void>
  onCommentAdded: (id: string) => void
}

export function PostCard({
  post,
  canWrite,
  currentUserId,
  likedByMe,
  savedByMe,
  onDelete,
  onLike,
  onSave,
  onCommentAdded,
}: PostCardProps) {
  const [liked, setLiked] = useState(likedByMe)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [saved, setSaved] = useState(savedByMe)
  const [liking, setLiking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  async function handleLike() {
    if (!canWrite) { toast.error('Beğeni için M2+ planı gerekiyor.'); return }
    setLiking(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikesCount(c => c + (wasLiked ? -1 : 1))
    await onLike(post.id)
    setLiking(false)
  }

  async function handleSave() {
    setSaving(true)
    const wasSaved = saved
    setSaved(!wasSaved)
    await onSave(post.id, wasSaved)
    setSaving(false)
    toast.success(wasSaved ? 'Kaydedilenlerden kaldırıldı' : 'Kaydedildi')
  }

  function handleCommentAdded() {
    setCommentCount(c => c + 1)
    onCommentAdded(post.id)
  }

  const isOwn = post.user_id === currentUserId
  const subscriptionBadge = post.profiles?.subscription_tier === 'm3'
    ? <span className="text-[8px] font-bold text-primary bg-primary0/10 px-1.5 py-0.5 rounded-full">PRO</span>
    : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl overflow-hidden hover:border-[rgba(255,255,255,0.1)] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/community/profile/${post.profiles?.username}`}>
            <div className="w-9 h-9 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-sm font-semibold shrink-0 overflow-hidden hover:ring-2 hover:ring-[#2dd4bf]/40 transition-all">
              {post.profiles?.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                : (post.profiles?.full_name || post.profiles?.username || '?').charAt(0).toUpperCase()
              }
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/dashboard/community/profile/${post.profiles?.username}`}
                className="text-[#ffffff] text-sm font-medium hover:underline">
                {post.profiles?.full_name || post.profiles?.username || 'Kullanıcı'}
              </Link>
              {subscriptionBadge}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[#999999] text-xs">@{post.profiles?.username} · {timeAgo(post.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PostTypeBadge type={post.post_type} />
          {isOwn && (
            <button onClick={() => onDelete(post.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-[#999999] hover:text-anchor-graphite hover:bg-anchor-graphite0/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-3">
        <PostCardBody post={post} onOpenComments={() => setCommentsOpen(true)} onImageClick={setLightboxSrc} />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-anchor-graphite' : 'text-[#999999] hover:text-anchor-graphite'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-anchor-graphite' : ''}`} />
            <span>{likesCount > 0 ? likesCount : ''}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[#999999] hover:text-[#ffffff] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount > 0 ? commentCount : ''}</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`transition-colors ${saved ? 'text-[#2dd4bf]' : 'text-[#999999] hover:text-[#2dd4bf]'}`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#2dd4bf]' : ''}`} />
        </button>
      </div>

      {/* Comments */}
      {commentsOpen && (
        <div className="px-4 pb-4 border-t border-[rgba(255,255,255,0.05)] pt-3">
          <CommentSection
            postId={post.id}
            postType={post.post_type}
            postOwnerId={post.user_id}
            currentUserId={currentUserId}
            canWrite={canWrite}
            initialCommentCount={commentCount}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}

      <AnimatePresence>
        {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      </AnimatePresence>
    </motion.article>
  )
}
