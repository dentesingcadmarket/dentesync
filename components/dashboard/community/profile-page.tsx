'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Pencil, Loader2,
  X, Save, Camera, Calendar, Hash, Heart, FileText,
  TrendingUp, Bookmark, MessageSquare, Award, Star,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfile, getUserPosts, getSavedPosts, getUserComments } from '@/app/actions/community'
import type { Profile, CommunityPost, CommunityComment, UserBadge } from '@/lib/supabase/types'
import Link from 'next/link'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

type CommentWithPost = CommunityComment & {
  community_posts?: { title: string | null; content: string | null; post_type: string | null } | null
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

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
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

type ProfileData = Pick<Profile,
  'id' | 'username' | 'full_name' | 'avatar_url' | 'bio' | 'cover_url' |
  'posts_count' | 'subscription_tier'
> & {
  created_at?: string
  specialty?: string | null
  experience_years?: number | null
  technical_score?: number
  solution_score?: number
  teaching_score?: number
}

interface Props {
  profile: ProfileData
  initialPosts: PostWithProfile[]
  isSelf: boolean
  currentUserId: string
  topHashtags: { name: string; count: number }[]
  badges?: UserBadge[]
}

function tierBadge(tier: string) {
  const map: Record<string, { label: string; cls: string; desc: string }> = {
    m1: { label: 'M1', cls: 'bg-[#999999]/20 text-[#999999]', desc: 'Temel Plan' },
    m2: { label: 'M2', cls: 'bg-[#2dd4bf]/20 text-[#2dd4bf]', desc: 'Standart Plan' },
    m3: { label: 'M3', cls: 'bg-primary0/20 text-primary', desc: 'Premium Plan' },
  }
  const b = map[tier] ?? map.m1
  return { ...b }
}

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[#999999] text-xs">{label}</span>
        <span className="text-[#999999] text-[10px]">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1f1f20] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function PostCard({ post }: { post: PostWithProfile }) {
  return (
    <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[#999999] text-xs">{timeAgo(post.created_at)}</span>
      </div>
      {post.title && (
        <p className="text-[#ffffff] text-sm font-medium mb-1">{post.title}</p>
      )}
      {post.content && (
        <p className="text-[#ffffff] text-sm leading-relaxed whitespace-pre-wrap">
          {renderContent(post.content)}
        </p>
      )}
      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image_url} alt="Gönderi" loading="lazy"
          className="w-full rounded-xl mt-3 max-h-64 object-cover border border-[rgba(229,231,235,0.08)]" />
      )}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] text-[#999999] text-xs">
        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{post.comment_count} yorum</span>
      </div>
    </div>
  )
}

function CommentCard({ comment }: { comment: CommentWithPost }) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors ${
      comment.is_best_answer
        ? 'bg-primary0/5 border-primary0/20 border-l-2 border-l-green-500'
        : 'bg-[#161617] border-[rgba(229,231,235,0.08)]'
    }`}>
      {comment.community_posts && (
        <p className="text-[#525252] text-[10px] mb-2 truncate">
          {comment.community_posts.title || comment.community_posts.content?.slice(0, 60) || 'Gönderi'} yazısına yanıt
        </p>
      )}
      <p className="text-[#999999] text-sm leading-relaxed">{comment.content}</p>
      {comment.technical_note && (
        <div className="mt-2 p-2 rounded-lg bg-[#1f1f20] border-l-2 border-[#2dd4bf]/50">
          <p className="text-[10px] text-[#2dd4bf] font-medium mb-0.5">Teknik Değerlendirme</p>
          <p className="text-[#999999] text-xs">{comment.technical_note}</p>
        </div>
      )}
      <div className="flex items-center gap-3 mt-3 text-[#999999] text-xs">
        <span>{timeAgo(comment.created_at)}</span>
        {comment.is_best_answer && (
          <span className="flex items-center gap-1 text-primary text-[10px] font-medium">
            <Award className="w-3 h-3" /> En İyi Yanıt
          </span>
        )}
        {comment.helpful_count > 0 && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" /> {comment.helpful_count} yardımcı
          </span>
        )}
      </div>
    </div>
  )
}

function SavedPostCard({ post }: { post: PostWithProfile }) {
  return (
    <div className="rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] overflow-hidden aspect-square relative group cursor-default">
      {post.image_url
        ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
        )
        : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <p className="text-[#999999] text-xs line-clamp-5 leading-relaxed text-center">{post.content}</p>
          </div>
        )
      }
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2.5 opacity-0 group-hover:opacity-100">
        <div className="flex items-center gap-2.5 text-white text-xs font-medium">
          <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-white" />{post.likes}</span>
          <span className="text-white/60">{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

function EditProfileModal({ profile, onClose }: { profile: ProfileData; onClose: (updated?: Partial<ProfileData>) => void }) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? '',
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url ?? '',
    cover_url: profile.cover_url ?? '',
    specialty: profile.specialty ?? '',
    experience_years: profile.experience_years?.toString() ?? '',
  })
  const [isSaving, startSave] = useTransition()
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  async function uploadFile(file: File, type: 'avatar' | 'cover') {
    if (type === 'avatar') setUploadingAvatar(true)
    else setUploadingCover(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/community/upload-${type}`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Yükleme başarısız.'); return }
      if (type === 'avatar') setFormData(p => ({ ...p, avatar_url: data.url }))
      else setFormData(p => ({ ...p, cover_url: data.url }))
      toast.success(type === 'avatar' ? 'Avatar güncellendi' : 'Kapak güncellendi')
    } finally {
      if (type === 'avatar') setUploadingAvatar(false)
      else setUploadingCover(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const expYears = formData.experience_years ? parseInt(formData.experience_years) : undefined
    if (expYears !== undefined && (isNaN(expYears) || expYears < 0 || expYears > 50)) {
      toast.error('Deneyim yılı 0–50 arasında olmalıdır.')
      return
    }
    startSave(async () => {
      const result = await updateProfile({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        cover_url: formData.cover_url,
        specialty: formData.specialty || undefined,
        experience_years: expYears,
      })
      if (result.error) { toast.error(result.error); return }
      toast.success('Profil güncellendi!')
      onClose({
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        cover_url: formData.cover_url,
        specialty: formData.specialty || null,
        experience_years: expYears ?? null,
      })
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-sm bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(229,231,235,0.08)] sticky top-0 bg-[#161617]">
          <p className="text-[#ffffff] font-medium">Profili Düzenle</p>
          <button onClick={() => onClose()} className="text-[#999999] hover:text-[#ffffff] transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="relative h-20 rounded-xl overflow-hidden bg-gradient-to-r from-[#2dd4bf]/30 to-[#1d4ed8]/10 border border-[rgba(229,231,235,0.08)]">
            {formData.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formData.cover_url} alt="" className="w-full h-full object-cover" />
            )}
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors group">
              <Camera className="w-5 h-5 text-white opacity-60 group-hover:opacity-100" />
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'cover') }} />
            </label>
            {uploadingCover && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><Loader2 className="w-5 h-5 animate-spin text-white" /></div>}
          </div>

          <div className="flex justify-center -mt-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-2xl font-semibold overflow-hidden border-2 border-[#161617]">
                {formData.avatar_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  : (formData.full_name || formData.username || '?').charAt(0).toUpperCase()
                }
              </div>
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full hover:bg-black/50 transition-colors group">
                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'avatar') }} />
              </label>
              {uploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"><Loader2 className="w-4 h-4 animate-spin text-white" /></div>}
            </div>
          </div>

          <div>
            <label className="text-[#999999] text-xs mb-1.5 block">Ad Soyad</label>
            <input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Adınız Soyadınız"
              className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors" />
          </div>

          <div>
            <label className="text-[#999999] text-xs mb-1.5 block">Kullanıcı Adı</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] text-sm">@</span>
              <input value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                placeholder="kullanici_adi" maxLength={30}
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-[#999999] text-xs mb-1.5 block">Uzmanlık Alanı</label>
            <input value={formData.specialty} onChange={e => setFormData(p => ({ ...p, specialty: e.target.value }))}
              placeholder="ör. İmplantoloji, Protetik Diş"
              className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors" />
          </div>

          <div>
            <label className="text-[#999999] text-xs mb-1.5 block">Deneyim (Yıl)</label>
            <input type="number" min={0} max={50} value={formData.experience_years}
              onChange={e => setFormData(p => ({ ...p, experience_years: e.target.value }))}
              placeholder="ör. 5"
              className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors" />
          </div>

          <div>
            <label className="text-[#999999] text-xs mb-1.5 flex items-center justify-between">
              <span>Bio</span>
              <span className={formData.bio.length > 140 ? 'text-muted-silver' : 'text-[#999999]'}>{formData.bio.length}/160</span>
            </label>
            <textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Kendinizden kısaca bahsedin..." rows={3} maxLength={160}
              className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm resize-none focus:outline-none focus:border-[#2dd4bf] transition-colors" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => onClose()}
              className="flex-1 px-4 py-2 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] text-sm hover:bg-white/5 transition-colors">
              İptal
            </button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#2dd4bf] text-white text-sm font-medium disabled:opacity-50 cursor-pointer">
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Kaydet
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

const HASHTAG_COLORS = [
  'bg-[#2dd4bf]/15 text-[#2dd4bf] border-[#2dd4bf]/20',
  'bg-primary0/15 text-primary border-primary0/20',
  'bg-primary0/15 text-primary border-primary0/20',
  'bg-anchor-graphite0/15 text-anchor-graphite border-anchor-graphite0/20',
  'bg-primary0/15 text-primary border-primary0/20',
  'bg-primary0/15 text-primary border-primary0/20',
  'bg-muted-silver0/15 text-muted-silver border-muted-silver0/20',
  'bg-anchor-graphite0/15 text-anchor-graphite border-anchor-graphite0/20',
]

const BADGE_COLOR_MAP: Record<string, string> = {
  ilk_adim: 'bg-primary0/20 text-primary',
  aktif_uye: 'bg-primary0/20 text-primary',
  cozum_uretici: 'bg-primary0/20 text-primary',
  guvenilir_kaynak: 'bg-muted-silver0/20 text-muted-silver',
  zirkonyum_uzmani: 'bg-primary0/20 text-primary',
  implant_uzmani: 'bg-anchor-graphite0/20 text-anchor-graphite',
  hata_avcisi: 'bg-anchor-graphite0/20 text-anchor-graphite',
  surec_ustasi: 'bg-primary0/20 text-primary',
}

export function ProfilePageClient({ profile: initialProfile, initialPosts, isSelf, topHashtags, badges = [] }: Props) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'answers' | 'saved'>('posts')

  const [posts, setPosts] = useState(initialPosts)
  const [postsPage, setPostsPage] = useState(0)
  const [loadingMorePosts, setLoadingMorePosts] = useState(false)
  const [hasMorePosts, setHasMorePosts] = useState(initialPosts.length === 20)

  const [comments, setComments] = useState<CommentWithPost[]>([])
  const [commentsPage, setCommentsPage] = useState(0)
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [hasMoreComments, setHasMoreComments] = useState(true)

  const [savedPosts, setSavedPosts] = useState<PostWithProfile[]>([])
  const [savedPage, setSavedPage] = useState(0)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)
  const [hasMoreSaved, setHasMoreSaved] = useState(true)

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes ?? 0), 0)
  const tier = tierBadge(profile.subscription_tier)

  function handleEditClose(updated?: Partial<ProfileData>) {
    setShowEdit(false)
    if (updated) {
      setProfile(prev => ({ ...prev, ...updated }))
      router.refresh()
    }
  }

  async function loadMorePosts() {
    setLoadingMorePosts(true)
    const nextPage = postsPage + 1
    const result = await getUserPosts(profile.id, { page: nextPage })
    setLoadingMorePosts(false)
    if (result.error || !result.data) return
    const newPosts = result.data as PostWithProfile[]
    setPosts(prev => [...prev, ...newPosts])
    setPostsPage(nextPage)
    setHasMorePosts(newPosts.length === 20)
  }

  async function loadAnswers() {
    if (commentsLoaded) return
    setLoadingComments(true)
    const result = await getUserComments(profile.id, 0)
    setLoadingComments(false)
    setCommentsLoaded(true)
    if (result.error || !result.data) return
    setComments(result.data as CommentWithPost[])
    setHasMoreComments(result.data.length === 20)
  }

  async function loadMoreAnswers() {
    setLoadingComments(true)
    const nextPage = commentsPage + 1
    const result = await getUserComments(profile.id, nextPage)
    setLoadingComments(false)
    if (result.error || !result.data) return
    const newComments = result.data as CommentWithPost[]
    setComments(prev => [...prev, ...newComments])
    setCommentsPage(nextPage)
    setHasMoreComments(newComments.length === 20)
  }

  async function loadSavedPosts() {
    if (savedLoaded) return
    setLoadingSaved(true)
    const result = await getSavedPosts(0)
    setLoadingSaved(false)
    setSavedLoaded(true)
    if (result.error || !result.data) return
    setSavedPosts(result.data as PostWithProfile[])
    setHasMoreSaved(result.data.length === 20)
  }

  async function loadMoreSaved() {
    setLoadingSaved(true)
    const nextPage = savedPage + 1
    const result = await getSavedPosts(nextPage)
    setLoadingSaved(false)
    if (result.error || !result.data) return
    const newPosts = result.data as PostWithProfile[]
    setSavedPosts(prev => [...prev, ...newPosts])
    setSavedPage(nextPage)
    setHasMoreSaved(newPosts.length === 20)
  }

  function handleTabChange(tab: 'posts' | 'about' | 'answers' | 'saved') {
    setActiveTab(tab)
    if (tab === 'answers' && !commentsLoaded) loadAnswers()
    if (tab === 'saved' && !savedLoaded) loadSavedPosts()
  }

  const tabs = [
    { key: 'posts' as const, label: 'Gönderiler', icon: FileText },
    { key: 'about' as const, label: 'Hakkında', icon: TrendingUp },
    ...(isSelf ? [
      { key: 'answers' as const, label: 'Cevapları', icon: MessageSquare },
      { key: 'saved' as const, label: 'Kaydedilenler', icon: Bookmark },
    ] : [
      { key: 'answers' as const, label: 'Cevapları', icon: MessageSquare },
    ]),
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cover */}
      <div className="relative h-36 lg:h-48 bg-gradient-to-r from-[#2dd4bf]/30 to-[#1d4ed8]/10 overflow-hidden">
        {profile.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.cover_url} alt="Kapak" className="w-full h-full object-cover" />
        )}
        <button onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-2">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-[#000000] bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-3xl font-semibold overflow-hidden shrink-0">
            {profile.avatar_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={profile.avatar_url} alt={profile.username || ''} className="w-full h-full object-cover" />
              : (profile.full_name || profile.username || '?').charAt(0).toUpperCase()
            }
          </div>
          <div className="mt-12 flex gap-2">
            {isSelf && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-sm hover:bg-white/5 transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Düzenle
              </motion.button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h1 className="text-xl font-semibold text-[#ffffff]">
              {profile.full_name || profile.username || 'Kullanıcı'}
            </h1>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tier.cls}`}>{tier.label}</span>
          </div>
          {profile.username && <p className="text-[#999999] text-sm">@{profile.username}</p>}

          {/* Specialty & experience */}
          {(profile.specialty || profile.experience_years) && (
            <p className="text-[#999999] text-sm mt-1">
              {profile.specialty}
              {profile.specialty && profile.experience_years ? ' · ' : ''}
              {profile.experience_years ? `${profile.experience_years} yıl deneyim` : ''}
            </p>
          )}

          {profile.bio && <p className="text-[#999999] text-sm mt-2 leading-relaxed">{profile.bio}</p>}
          {profile.created_at && (
            <div className="flex items-center gap-1.5 mt-2 text-[#525252] text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatJoinDate(profile.created_at)} tarihinde katıldı</span>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {badges.map(badge => (
                <span key={badge.id}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${BADGE_COLOR_MAP[badge.badge_key] ?? 'bg-[#1f1f20] text-[#999999]'}`}>
                  <Award className="w-2.5 h-2.5" />
                  {badge.badge_label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 py-4 border-y border-[rgba(255,255,255,0.06)] mb-4">
          <div className="flex flex-col items-center">
            <span className="text-[#ffffff] text-sm font-semibold">{profile.posts_count}</span>
            <span className="text-[#999999] text-xs">Gönderi</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#ffffff] text-sm font-semibold">{totalLikes}</span>
            <span className="text-[#999999] text-xs">Beğeni</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-[#161617] rounded-xl p-1 border border-[rgba(255,255,255,0.05)]">
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.key
            return (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#2dd4bf] text-white shadow-sm'
                    : 'text-[#999999] hover:text-[#999999] hover:bg-white/5'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-8">
        <AnimatePresence mode="wait">

          {/* Gönderiler */}
          {activeTab === 'posts' && (
            <motion.div key="posts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              {posts.length === 0 && (
                <p className="text-[#999999] text-sm text-center py-10">Henüz gönderi yok.</p>
              )}
              {posts.map(post => <PostCard key={post.id} post={post} />)}
              {hasMorePosts && (
                <button onClick={loadMorePosts} disabled={loadingMorePosts}
                  className="w-full py-3 rounded-xl border border-[rgba(229,231,235,0.08)] text-[#999999] text-sm hover:bg-white/5 hover:text-[#ffffff] transition-colors flex items-center justify-center gap-2">
                  {loadingMorePosts ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daha fazla yükle'}
                </button>
              )}
            </motion.div>
          )}

          {/* Hakkında */}
          {activeTab === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">

              <div className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
                <p className="text-[#999999] text-xs font-medium uppercase tracking-wider mb-3">Hesap</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#999999] text-sm">Plan</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tier.cls}`}>{tier.desc}</span>
                  </div>
                  {profile.created_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#999999] text-sm flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Katılma Tarihi
                      </span>
                      <span className="text-[#999999] text-sm">{formatJoinDate(profile.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skill Bars */}
              {((profile.technical_score ?? 0) > 0 || (profile.solution_score ?? 0) > 0 || (profile.teaching_score ?? 0) > 0) && (
                <div className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
                  <p className="text-[#999999] text-xs font-medium uppercase tracking-wider mb-4">Yetkinlik Puanları</p>
                  <div className="space-y-3.5">
                    <SkillBar label="Teknik" value={profile.technical_score ?? 0} color="bg-[#2dd4bf]" />
                    <SkillBar label="Çözüm" value={profile.solution_score ?? 0} color="bg-primary0" />
                    <SkillBar label="Öğretme" value={profile.teaching_score ?? 0} color="bg-primary0" />
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
                <p className="text-[#999999] text-xs font-medium uppercase tracking-wider mb-3">İstatistikler</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Toplam Gönderi', value: profile.posts_count },
                    { label: 'Beğeni Alınan', value: totalLikes },
                  ].map(stat => (
                    <div key={stat.label} className="p-3 rounded-xl bg-[#1f1f20] border border-[rgba(255,255,255,0.04)]">
                      <div className="text-[#ffffff] text-lg font-semibold">{stat.value}</div>
                      <div className="text-[#999999] text-xs mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {topHashtags.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
                  <p className="text-[#999999] text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> İlgi Alanları
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topHashtags.map((tag, i) => (
                      <Link key={tag.name} href={`/dashboard/community/hashtag/${tag.name}`}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-opacity hover:opacity-80 ${HASHTAG_COLORS[i % HASHTAG_COLORS.length]}`}>
                        <Hash className="w-3 h-3" />
                        {tag.name}
                        <span className="opacity-60 text-[10px]">×{tag.count}</span>
                      </Link>
                    ))}
                  </div>
                  <p className="text-[#525252] text-xs mt-3">En çok kullanılan hashtag&apos;lere göre analiz edildi.</p>
                </div>
              )}

              {topHashtags.length === 0 && (
                <div className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
                  <p className="text-[#999999] text-xs font-medium uppercase tracking-wider mb-2">İlgi Alanları</p>
                  <p className="text-[#525252] text-sm">Gönderi paylaşıldıkça ilgi alanları burada görünecek.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Cevapları */}
          {activeTab === 'answers' && (
            <motion.div key="answers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-3">
              {loadingComments && !commentsLoaded && (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />
                </div>
              )}
              {commentsLoaded && comments.length === 0 && (
                <p className="text-[#999999] text-sm text-center py-10">Henüz yanıt yok.</p>
              )}
              {comments.map(comment => <CommentCard key={comment.id} comment={comment} />)}
              {hasMoreComments && commentsLoaded && comments.length > 0 && (
                <button onClick={loadMoreAnswers} disabled={loadingComments}
                  className="w-full py-3 rounded-xl border border-[rgba(229,231,235,0.08)] text-[#999999] text-sm hover:bg-white/5 hover:text-[#ffffff] transition-colors flex items-center justify-center gap-2">
                  {loadingComments ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daha fazla yükle'}
                </button>
              )}
            </motion.div>
          )}

          {/* Kaydedilenler (sadece kendi profili) */}
          {activeTab === 'saved' && isSelf && (
            <motion.div key="saved" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              {loadingSaved && !savedLoaded && (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />
                </div>
              )}
              {savedLoaded && savedPosts.length === 0 && (
                <div className="text-center py-14 text-[#999999]">
                  <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Henüz kaydedilen gönderi yok.</p>
                  <p className="text-xs mt-1 text-[#525252]">Gönderileri kaydetmek için bookmark ikonuna tıklayın.</p>
                </div>
              )}
              {savedPosts.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {savedPosts.map(post => <SavedPostCard key={post.id} post={post} />)}
                </div>
              )}
              {hasMoreSaved && savedLoaded && savedPosts.length > 0 && (
                <button onClick={loadMoreSaved} disabled={loadingSaved}
                  className="w-full mt-2 py-3 rounded-xl border border-[rgba(229,231,235,0.08)] text-[#999999] text-sm hover:bg-white/5 hover:text-[#ffffff] transition-colors flex items-center justify-center gap-2">
                  {loadingSaved ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Daha fazla yükle'}
                </button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showEdit && <EditProfileModal profile={profile} onClose={handleEditClose} />}
      </AnimatePresence>
    </div>
  )
}
