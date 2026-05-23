'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThumbsUp, Award, Loader2, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { getComments, addComment, markBestAnswer, markHelpful } from '@/app/actions/community'
import type { PostType, CommunityComment, Profile } from '@/lib/supabase/types'

type CommentWithProfile = CommunityComment & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
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

function Avatar({ profile, size = 8 }: { profile?: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-xs font-semibold shrink-0 overflow-hidden`
  return (
    <div className={cls}>
      {profile?.avatar_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        : (profile?.full_name || profile?.username || '?').charAt(0).toUpperCase()
      }
    </div>
  )
}

interface CommentItemProps {
  comment: CommentWithProfile
  postOwnerId: string
  currentUserId: string
  postId: string
  canWrite: boolean
  onRefresh: () => void
}

function CommentItem({ comment, postOwnerId, currentUserId, postId, canWrite, onRefresh }: CommentItemProps) {
  const [helpfulCount, setHelpfulCount] = useState(comment.helpful_count)
  const [isBest] = useState(comment.is_best_answer)
  const [helpfulLoading, setHelpfulLoading] = useState(false)
  const [bestLoading, setBestLoading] = useState(false)

  async function handleHelpful() {
    if (!canWrite) { toast.error('Bu özellik M2+ planında mevcut.'); return }
    setHelpfulLoading(true)
    const result = await markHelpful(comment.id)
    setHelpfulLoading(false)
    if (result.error) { toast.error(result.error); return }
    setHelpfulCount(result.helpful_count ?? helpfulCount)
  }

  async function handleBestAnswer() {
    setBestLoading(true)
    const result = await markBestAnswer(comment.id, postId)
    setBestLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('En iyi yanıt seçildi!')
    onRefresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 p-3 rounded-xl transition-colors ${
        isBest
          ? 'bg-primary0/5 border border-primary0/20 border-l-2 border-l-green-500'
          : 'bg-[#161617] border border-[rgba(255,255,255,0.05)]'
      }`}
    >
      <Avatar profile={comment.profiles} size={7} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#ffffff] text-xs font-medium">
            {comment.profiles?.full_name || comment.profiles?.username || 'Kullanıcı'}
          </span>
          <span className="text-[#999999] text-[10px]">{timeAgo(comment.created_at)}</span>
          {isBest && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary0/15 px-1.5 py-0.5 rounded-full">
              <Award className="w-2.5 h-2.5" /> EN İYİ YANIT
            </span>
          )}
        </div>

        <p className="text-[#999999] text-sm leading-relaxed">{comment.content}</p>

        {comment.technical_note && (
          <div className="mt-2 p-2 rounded-lg bg-[#1f1f20] border-l-2 border-[#2dd4bf]/50">
            <p className="text-[10px] text-[#2dd4bf] font-medium mb-0.5">Teknik Değerlendirme</p>
            <p className="text-[#999999] text-xs">{comment.technical_note}</p>
          </div>
        )}
        {comment.suggestion && (
          <div className="mt-2 p-2 rounded-lg bg-[#1f1f20] border-l-2 border-primary0/50">
            <p className="text-[10px] text-primary font-medium mb-0.5">Öneri</p>
            <p className="text-[#999999] text-xs">{comment.suggestion}</p>
          </div>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleHelpful}
            disabled={helpfulLoading}
            className="flex items-center gap-1 text-[#999999] hover:text-[#2dd4bf] transition-colors text-xs"
          >
            {helpfulLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
            Yardımcı Oldu{helpfulCount > 0 && ` (${helpfulCount})`}
          </button>

          {currentUserId === postOwnerId && !isBest && (
            <button
              onClick={handleBestAnswer}
              disabled={bestLoading}
              className="flex items-center gap-1 text-[#999999] hover:text-primary transition-colors text-xs"
            >
              {bestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Award className="w-3 h-3" />}
              En İyi Yanıt
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface CommentSectionProps {
  postId: string
  postType: PostType
  postOwnerId: string
  currentUserId: string
  canWrite: boolean
  initialCommentCount: number
  onCommentAdded: () => void
}

export function CommentSection({
  postId,
  postType,
  postOwnerId,
  currentUserId,
  canWrite,
  initialCommentCount,
  onCommentAdded,
}: CommentSectionProps) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [technicalNote, setTechnicalNote] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const isStructured = ['consultation', 'critique_request'].includes(postType)

  function refreshComments() {
    setLoading(true)
    getComments(postId).then(result => {
      if (result.data) setComments(result.data as CommentWithProfile[])
      else toast.error('Yorumlar yüklenemedi.')
      setLoading(false)
    })
  }

  useEffect(() => {
    if (open && !loaded) {
      setLoading(true)
      getComments(postId).then(result => {
        if (result.data) setComments(result.data as CommentWithProfile[])
        else toast.error('Yorumlar yüklenemedi.')
        setLoaded(true)
        setLoading(false)
      })
    }
  }, [open, loaded, postId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) { toast.error('Yorum boş olamaz.'); return }
    if (isStructured && !technicalNote.trim()) { toast.error('Teknik Değerlendirme zorunludur.'); return }
    if (isStructured && !suggestion.trim()) { toast.error('Öneri alanı zorunludur.'); return }
    setSubmitting(true)
    const result = await addComment({
      postId,
      content: content.trim(),
      technicalNote: technicalNote.trim() || undefined,
      suggestion: suggestion.trim() || undefined,
    })
    setSubmitting(false)
    if (result.error) { toast.error(result.error); return }
    setComments(prev => [...prev, result.data as CommentWithProfile])
    setContent('')
    setTechnicalNote('')
    setSuggestion('')
    onCommentAdded()
    toast.success('Yorum gönderildi!')
  }

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-[#999999] hover:text-[#ffffff] transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {initialCommentCount > 0 ? `${initialCommentCount} yorum` : 'Yorum yaz'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2">
              {loading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-[#999999]" />
                </div>
              )}

              {!loading && comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  postOwnerId={postOwnerId}
                  currentUserId={currentUserId}
                  postId={postId}
                  canWrite={canWrite}
                  onRefresh={refreshComments}
                />
              ))}

              {!loading && loaded && comments.length === 0 && (
                <p className="text-center text-[#999999] text-xs py-3">Henüz yorum yok. İlk yorumu siz yapın!</p>
              )}

              {/* Yorum formu */}
              {canWrite ? (
                <form onSubmit={handleSubmit} className="pt-2 space-y-2">
                  {isStructured && (
                    <>
                      <div>
                        <label className="block text-[10px] font-medium text-[#999999] mb-1.5">Teknik Değerlendirme <span className="text-anchor-graphite">*</span></label>
                        <textarea
                          value={technicalNote}
                          onChange={e => setTechnicalNote(e.target.value)}
                          rows={2}
                          placeholder="Teknik açıdan değerlendirmeniz..."
                          className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-xs placeholder:text-[#999999] resize-none focus:outline-none focus:border-[#2dd4bf]/60"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#999999] mb-1.5">Önerim <span className="text-anchor-graphite">*</span></label>
                        <textarea
                          value={suggestion}
                          onChange={e => setSuggestion(e.target.value)}
                          rows={2}
                          placeholder="Öneriniz veya çözüm yolunuz..."
                          className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-xs placeholder:text-[#999999] resize-none focus:outline-none focus:border-[#2dd4bf]/60"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      rows={2}
                      placeholder={isStructured ? 'Ek notlarınız...' : 'Yorumunuzu yazın...'}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-sm placeholder:text-[#999999] resize-none focus:outline-none focus:border-[#2dd4bf]/60"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !content.trim()}
                      className="self-end px-4 py-2 rounded-xl bg-[#2dd4bf] text-white text-xs font-medium hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Gönder'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="relative mt-2">
                  <div className="px-4 py-3 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] flex items-center gap-3 opacity-60">
                    <Lock className="w-4 h-4 text-[#999999] shrink-0" />
                    <span className="text-[#999999] text-xs">Yorum yazmak için M2 planına geçin</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
