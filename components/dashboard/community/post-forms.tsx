'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, ImageIcon, Plus, Trash2, Loader2, Star, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { createPost } from '@/app/actions/community'
import { HashtagInput } from './hashtag-input'
import { StlUpload } from './stl-upload'
import type { PostType, Hashtag, CommunityPost, Profile } from '@/lib/supabase/types'

export type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'subscription_tier' | 'posts_count'> | null
}

interface BaseFormProps {
  onCreated: (post: PostWithProfile) => void
  onClose: () => void
}

// ── Paylaşılan yardımcılar ──────────────────────────────────────

function FormHeader({ title, badge, badgeCls, onClose }: {
  title: string
  badge: string
  badgeCls: string
  onClose: () => void
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(229,231,235,0.08)]">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCls}`}>{badge}</span>
        <h2 className="text-[#ffffff] font-semibold text-sm">{title}</h2>
      </div>
      <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-[#999999] hover:text-[#ffffff] hover:bg-white/5 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function SubmitBtn({ loading, label = 'Paylaş' }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  )
}

function ImageUpload({ onUpload, value, label = 'Görsel Yükle (zorunlu)' }: {
  onUpload: (url: string) => void
  value?: string
  label?: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/community/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Yükleme başarısız')
        return
      }
      if (data.url) onUpload(data.url)
      else toast.error(data.error ?? 'Yükleme başarısız')
    } catch {
      toast.error('Yükleme hatası')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-[#999999] mb-2">{label}</label>
      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full max-h-56 object-cover rounded-xl border border-[rgba(229,231,235,0.08)]" />
          <button type="button" onClick={() => onUpload('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.1)] hover:border-[#2563eb]/50 hover:bg-[#2563eb]/5 flex flex-col items-center justify-center gap-2 text-[#999999] hover:text-[#2563eb] transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          <span className="text-xs">{uploading ? 'Yükleniyor...' : 'Tıkla veya sürükle'}</span>
          <span className="text-[10px]">JPG, PNG, WebP · max 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, required, maxLength = 1500, rows = 4 }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  maxLength?: number
  rows?: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[#999999]">{label}{required && <span className="text-anchor-graphite ml-0.5">*</span>}</label>
        <span className="text-[10px] text-[#999999]">{value.length}/{maxLength}</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm resize-none focus:outline-none focus:border-[#2563eb]/60 transition-colors"
      />
    </div>
  )
}

// ── Showcase ──────────────────────────────────────────────────

export function ShowcaseForm({ onCreated, onClose }: BaseFormProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [desc, setDesc] = useState('')
  const [technical, setTechnical] = useState('')
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [stlUrl, setStlUrl] = useState<string | null>(null)
  const [stlFilename, setStlFilename] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl) { toast.error('Görsel zorunludur.'); return }
    setLoading(true)
    const result = await createPost({
      post_type: 'showcase',
      content: desc.trim() || undefined,
      image_url: imageUrl,
      metadata: (technical.trim() || stlUrl) ? {
        ...(technical.trim() ? { technicalDetails: technical.trim() } : {}),
        ...(stlUrl ? { stl_url: stlUrl, stl_filename: stlFilename } : {}),
      } : undefined,
      hashtag_ids: hashtags.map(h => h.id),
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Gönderi paylaşıldı!')
    onCreated(result.data as PostWithProfile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <FormHeader title="Showcase" badge="SHOWCASE" badgeCls="bg-white/10 text-[#999999] border-white/10" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <ImageUpload onUpload={setImageUrl} value={imageUrl} />
          <Textarea label="Açıklama" value={desc} onChange={setDesc} placeholder="Çalışmanız hakkında..." maxLength={500} rows={3} />
          <Textarea label="Teknik Detaylar (opsiyonel)" value={technical} onChange={setTechnical} placeholder="Malzeme, teknik, ekipman..." maxLength={300} rows={2} />
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">3D Model (opsiyonel)</label>
            <StlUpload value={stlUrl} filename={stlFilename} onChange={(u, f) => { setStlUrl(u); setStlFilename(f) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Etiketler (max 5)</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitBtn loading={loading} />
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Consultation ──────────────────────────────────────────────

export function ConsultationForm({ onCreated, onClose }: BaseFormProps) {
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [problem, setProblem] = useState('')
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiOpen, setAiOpen] = useState(false)

  const getAiAnalysis = useCallback(async () => {
    if (!imageUrl && !problem.trim()) { toast.error('Görsel veya açıklama ekleyin.'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Diş teknisyeni danışma vakası analizi:\nVaka başlığı: ${title}\nSorun: ${problem}\n\nBu dental vaka için kısa bir ön analiz yap (3-5 madde).`,
          }],
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const text = data.content?.[0]?.text ?? data.message ?? 'Analiz alınamadı.'
      setAiAnalysis(text)
      setAiOpen(true)
    } catch {
      toast.error('AI analizi alınamadı.')
    } finally {
      setAiLoading(false)
    }
  }, [imageUrl, problem, title])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { toast.error('Başlık zorunludur.'); return }
    if (!imageUrl) { toast.error('En az bir görsel zorunludur.'); return }
    setLoading(true)
    const result = await createPost({
      post_type: 'consultation',
      title: title.trim(),
      content: problem.trim() || undefined,
      image_url: imageUrl,
      metadata: aiAnalysis ? { aiAnalysis } : undefined,
      hashtag_ids: hashtags.map(h => h.id),
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Danışma gönderildi!')
    onCreated(result.data as PostWithProfile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <FormHeader title="Vaka Danışması" badge="DANIŞMA" badgeCls="bg-anchor-graphite0/20 text-anchor-graphite border-anchor-graphite0/30" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Başlık <span className="text-anchor-graphite">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Örn: Zirkonyum kron marjin sorunu"
              maxLength={150}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2563eb]/60 transition-colors"
            />
          </div>
          <ImageUpload onUpload={setImageUrl} value={imageUrl} label="Görsel (zorunlu)" />
          <Textarea label="Sorun Açıklaması" value={problem} onChange={setProblem} placeholder="Karşılaştığınız sorunu detaylıca açıklayın..." required rows={4} />

          {/* AI Analiz */}
          <button
            type="button"
            onClick={getAiAnalysis}
            disabled={aiLoading}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-[#2563eb]/30 bg-[#2563eb]/5 text-[#2563eb] text-sm hover:bg-[#2563eb]/10 transition-colors disabled:opacity-50"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Ön Analizi Al
          </button>

          <AnimatePresence>
            {aiAnalysis && aiOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-xl bg-[#1f1f20] border border-[#2563eb]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#2563eb] flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> AI Analizi</span>
                  <button type="button" onClick={() => setAiOpen(false)} className="text-[#999999] hover:text-[#ffffff]">
                    {aiOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[#999999] text-xs leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Etiketler (max 5)</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitBtn loading={loading} label="Danışmaya Gönder" />
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Error Solution ────────────────────────────────────────────

export function ErrorSolutionForm({ onCreated, onClose }: BaseFormProps) {
  const [errorText, setErrorText] = useState('')
  const [solutionText, setSolutionText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!errorText.trim()) { toast.error('Hata açıklaması zorunludur.'); return }
    if (!solutionText.trim()) { toast.error('Çözüm açıklaması zorunludur.'); return }
    setLoading(true)
    const result = await createPost({
      post_type: 'error_solution',
      content: errorText.trim(),
      image_url: imageUrl || undefined,
      metadata: { solution: solutionText.trim() },
      hashtag_ids: hashtags.map(h => h.id),
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Hata çözümü paylaşıldı!')
    onCreated(result.data as PostWithProfile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <FormHeader title="Hata Çözümü" badge="HATA → ÇÖZÜM" badgeCls="bg-anchor-graphite0/20 text-anchor-graphite border-anchor-graphite0/30" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <Textarea label="Ne hata yaptım?" value={errorText} onChange={setErrorText} placeholder="Karşılaştığınız hatayı açıklayın..." required />
          <Textarea label="Nasıl çözdüm?" value={solutionText} onChange={setSolutionText} placeholder="Uyguladığınız çözümü açıklayın..." required />
          <ImageUpload onUpload={setImageUrl} value={imageUrl} label="Görsel (opsiyonel)" />
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Etiketler (max 5)</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitBtn loading={loading} label="Paylaş" />
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Material Review ───────────────────────────────────────────

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#999999]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`transition-colors ${n <= value ? 'text-muted-silver' : 'text-[#404040]'} hover:text-muted-silver`}>
            <Star className="w-4 h-4" fill={n <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  )
}

export function MaterialReviewForm({ onCreated, onClose }: BaseFormProps) {
  const [materialName, setMaterialName] = useState('')
  const [brand, setBrand] = useState('')
  const [usageArea, setUsageArea] = useState('')
  const [comment, setComment] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [ratings, setRatings] = useState({ islenebilirlik: 0, estetik: 0, dayaniklarlik: 0 })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!materialName.trim()) { toast.error('Materyal adı zorunludur.'); return }
    if (!comment.trim()) { toast.error('Detaylı yorum zorunludur.'); return }
    setLoading(true)
    const result = await createPost({
      post_type: 'material_review',
      title: materialName.trim(),
      content: comment.trim(),
      image_url: imageUrl || undefined,
      metadata: { brand: brand.trim(), usage_area: usageArea.trim(), ratings },
      hashtag_ids: hashtags.map(h => h.id),
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Değerlendirme paylaşıldı!')
    onCreated(result.data as PostWithProfile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <FormHeader title="Materyal Değerlendirmesi" badge="MATERYAL DEĞERLENDİRME" badgeCls="bg-primary0/20 text-primary border-primary0/30" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-2">Materyal Adı <span className="text-anchor-graphite">*</span></label>
              <input value={materialName} onChange={e => setMaterialName(e.target.value)} placeholder="Örn: Zirkonyum disk"
                className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-sm focus:outline-none focus:border-[#2563eb]/60" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#999999] mb-2">Marka</label>
              <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Marka adı"
                className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-sm focus:outline-none focus:border-[#2563eb]/60" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Kullanım Alanı</label>
            <input value={usageArea} onChange={e => setUsageArea(e.target.value)} placeholder="Örn: Ön grup kron"
              className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-sm focus:outline-none focus:border-[#2563eb]/60" />
          </div>

          {/* Yıldız puanları */}
          <div className="p-4 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)] space-y-3">
            <p className="text-xs font-medium text-[#999999]">Değerlendirme</p>
            <StarRating label="İşlenebilirlik" value={ratings.islenebilirlik} onChange={v => setRatings(r => ({ ...r, islenebilirlik: v }))} />
            <StarRating label="Estetik" value={ratings.estetik} onChange={v => setRatings(r => ({ ...r, estetik: v }))} />
            <StarRating label="Dayanıklılık" value={ratings.dayaniklarlik} onChange={v => setRatings(r => ({ ...r, dayaniklarlik: v }))} />
          </div>

          <Textarea label="Detaylı Yorum" value={comment} onChange={setComment} placeholder="Materyalin kullanımı hakkında detaylı görüşünüz..." required />
          <ImageUpload onUpload={setImageUrl} value={imageUrl} label="Görsel (opsiyonel)" />
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Etiketler (max 5)</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitBtn loading={loading} label="Değerlendirmeyi Paylaş" />
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Step by Step ──────────────────────────────────────────────

interface Step {
  id: string
  description: string
  imageUrl: string
}

export function StepByStepForm({ onCreated, onClose }: BaseFormProps) {
  const [caseTitle, setCaseTitle] = useState('')
  const [steps, setSteps] = useState<Step[]>([
    { id: crypto.randomUUID(), description: '', imageUrl: '' },
    { id: crypto.randomUUID(), description: '', imageUrl: '' },
  ])
  const [resultImage, setResultImage] = useState('')
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [stlUrl, setStlUrl] = useState<string | null>(null)
  const [stlFilename, setStlFilename] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function addStep() {
    setSteps(s => [...s, { id: crypto.randomUUID(), description: '', imageUrl: '' }])
  }

  function removeStep(id: string) {
    if (steps.length <= 2) return
    setSteps(s => s.filter(st => st.id !== id))
  }

  function updateStep(id: string, field: 'description' | 'imageUrl', val: string) {
    setSteps(s => s.map(st => st.id === id ? { ...st, [field]: val } : st))
  }

  async function uploadStepImage(id: string, file: File) {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/community/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Yükleme başarısız')
        return
      }
      if (data.url) updateStep(id, 'imageUrl', data.url)
      else toast.error(data.error ?? 'Yükleme başarısız')
    } catch {
      toast.error('Yükleme hatası')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!caseTitle.trim()) { toast.error('Vaka başlığı zorunludur.'); return }
    if (steps.some(s => !s.description.trim())) { toast.error('Tüm adımlara açıklama ekleyin.'); return }
    if (!resultImage) { toast.error('Sonuç görseli zorunludur.'); return }

    setLoading(true)
    const result = await createPost({
      post_type: 'step_by_step',
      title: caseTitle.trim(),
      image_url: resultImage,
      metadata: {
        steps: steps.map((s, i) => ({ step: i + 1, description: s.description, image_url: s.imageUrl || undefined })),
        result_image_url: resultImage,
        ...(stlUrl ? { stl_url: stlUrl, stl_filename: stlFilename } : {}),
      },
      hashtag_ids: hashtags.map(h => h.id),
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Süreç paylaşıldı!')
    onCreated(result.data as PostWithProfile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <FormHeader title="Step-by-Step" badge="SÜREÇ" badgeCls="bg-primary0/20 text-primary border-primary0/30" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Vaka Başlığı <span className="text-anchor-graphite">*</span></label>
            <input value={caseTitle} onChange={e => setCaseTitle(e.target.value)} placeholder="Örn: Tam seramik kron vaka süreci"
              maxLength={150}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-sm focus:outline-none focus:border-[#2563eb]/60" />
          </div>

          {/* Adımlar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#999999]">Adımlar <span className="text-anchor-graphite">*</span> <span className="text-[#999999] font-normal">(min 2)</span></p>
              <button type="button" onClick={addStep} className="flex items-center gap-1 text-xs text-[#2563eb] hover:text-[#2563eb] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Adım Ekle
              </button>
            </div>

            {steps.map((step, i) => (
              <div key={step.id} className="p-3 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#999999]">Adım {i + 1}</span>
                  {steps.length > 2 && (
                    <button type="button" onClick={() => removeStep(step.id)} className="text-[#999999] hover:text-anchor-graphite transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  value={step.description}
                  onChange={e => updateStep(step.id, 'description', e.target.value)}
                  placeholder={`Adım ${i + 1} açıklaması...`}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] text-xs placeholder:text-[#999999] resize-none focus:outline-none focus:border-[#2563eb]/60"
                />
                {step.imageUrl ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg border border-[rgba(229,231,235,0.08)]" />
                    <button type="button" onClick={() => updateStep(step.id, 'imageUrl', '')}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer text-[#999999] hover:text-[#2563eb] transition-colors text-xs">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Görsel ekle (opsiyonel)</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadStepImage(step.id, f) }} />
                  </label>
                )}
              </div>
            ))}
          </div>

          <ImageUpload onUpload={setResultImage} value={resultImage} label="Sonuç Görseli (zorunlu)" />
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">3D Model (opsiyonel)</label>
            <StlUpload value={stlUrl} filename={stlFilename} onChange={(u, f) => { setStlUrl(u); setStlFilename(f) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Etiketler (max 5)</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitBtn loading={loading} label="Süreci Paylaş" />
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Critique Request ──────────────────────────────────────────

export function CritiqueRequestForm({ onCreated, onClose }: BaseFormProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [what, setWhat] = useState('')
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [stlUrl, setStlUrl] = useState<string | null>(null)
  const [stlFilename, setStlFilename] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl) { toast.error('Görsel zorunludur.'); return }
    if (!what.trim()) { toast.error('Değerlendirilecek alan açıklaması zorunludur.'); return }
    setLoading(true)
    const result = await createPost({
      post_type: 'critique_request',
      content: what.trim(),
      image_url: imageUrl,
      metadata: stlUrl ? { stl_url: stlUrl, stl_filename: stlFilename } : undefined,
      hashtag_ids: hashtags.map(h => h.id),
    })
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success('Kritik isteği gönderildi!')
    onCreated(result.data as PostWithProfile)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <FormHeader title="Kritik İsteği" badge="KRİTİK İSTE" badgeCls="bg-primary0/20 text-primary border-primary0/30" onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <ImageUpload onUpload={setImageUrl} value={imageUrl} label="Görsel (zorunlu)" />
          <Textarea label="Neye bakılmasını istiyorum?" value={what} onChange={setWhat}
            placeholder="Uzmanların hangi konuya odaklanmasını istediğinizi belirtin..." required rows={4} />
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">3D Model (opsiyonel)</label>
            <StlUpload value={stlUrl} filename={stlFilename} onChange={(u, f) => { setStlUrl(u); setStlFilename(f) }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#999999] mb-2">Etiketler (max 5)</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>
          <div className="flex justify-end pt-2">
            <SubmitBtn loading={loading} label="Kritik İste" />
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Dağıtım bileşeni ──────────────────────────────────────────

interface PostFormRouterProps extends BaseFormProps {
  type: PostType
}

export function PostFormRouter({ type, onCreated, onClose }: PostFormRouterProps) {
  const props = { onCreated, onClose }
  switch (type) {
    case 'showcase': return <ShowcaseForm {...props} />
    case 'consultation': return <ConsultationForm {...props} />
    case 'error_solution': return <ErrorSolutionForm {...props} />
    case 'material_review': return <MaterialReviewForm {...props} />
    case 'step_by_step': return <StepByStepForm {...props} />
    case 'critique_request': return <CritiqueRequestForm {...props} />
    default: return null
  }
}
