'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Upload,
  X,
  ImageIcon,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  is_published: boolean
  published_at: string | null
  author_id: string | null
}

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  is_published: false,
}

type FormState = typeof EMPTY_FORM

interface Props {
  initialNews: NewsItem[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function NewsManager({ initialNews }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<NewsItem[]>(initialNews)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isSaving, startSave] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setItems(initialNews)
  }, [initialNews])

  function openCreate() {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(item: NewsItem) {
    setEditingItem(item)
    setForm({
      title: item.title,
      excerpt: item.excerpt ?? '',
      content: item.content ?? '',
      cover_image_url: item.cover_image_url ?? '',
      is_published: item.is_published,
    })
    setDialogOpen(true)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Görsel 10MB sınırını aşıyor.')
      return
    }

    setUploadingImage(true)
    const supabase = createClient()
    const ext = file.type.split('/')[1] ?? 'jpg'
    const path = `news/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from('store-images')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      toast.error(`Görsel yüklenemedi: ${uploadError.message}`)
      setUploadingImage(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage
      .from('store-images')
      .getPublicUrl(path)

    setForm(f => ({ ...f, cover_image_url: urlData.publicUrl }))
    setUploadingImage(false)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast.error('Başlık zorunludur.')
      return
    }

    startSave(async () => {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || null,
        cover_image_url: form.cover_image_url || null,
        is_published: form.is_published,
      }

      const isEdit = !!editingItem
      const url = isEdit
        ? `/api/admin/news/${editingItem.id}`
        : '/api/admin/news'

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'İşlem başarısız.')
        return
      }

      if (isEdit) {
        setItems(prev => prev.map(i => i.id === editingItem.id ? data.news : i))
        toast.success('Haber güncellendi.')
      } else {
        setItems(prev => [data.news, ...prev])
        toast.success('Haber oluşturuldu.')
      }
      setDialogOpen(false)
      router.refresh()
    })
  }

  function handleTogglePublish(item: NewsItem) {
    setItems(prev =>
      prev.map(i => i.id === item.id ? { ...i, is_published: !i.is_published } : i)
    )

    fetch(`/api/admin/news/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, is_published: !item.is_published }),
    }).then(res => {
      if (!res.ok) {
        setItems(prev =>
          prev.map(i => i.id === item.id ? { ...i, is_published: item.is_published } : i)
        )
        toast.error('Durum güncellenemedi.')
      } else {
        router.refresh()
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const res = await fetch(`/api/admin/news/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Silinemedi.')
        return
      }
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('Haber silindi.')
      router.refresh()
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto w-full space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0f1716] via-[#161617] to-[#161617] p-5 lg:p-6">
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#2dd4bf]/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2dd4bf]/20 to-[#2dd4bf]/5 border border-[#2dd4bf]/25 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#2dd4bf]" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-2xl leading-tight">Haber Yönetimi</h1>
              <p className="text-[#999999] text-sm mt-0.5">{items.length} haber</p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#2dd4bf] hover:bg-[#5eead4] text-[#0a0a0a] font-semibold rounded-full px-4 shadow-[0_0_24px_rgba(45,212,191,0.18)]"
          >
            <Plus className="w-4 h-4" />
            Yeni Haber
          </Button>
        </div>
      </div>

      {/* News List */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1f1f20] flex items-center justify-center">
            <Newspaper className="w-7 h-7 text-[#999999]" />
          </div>
          <p className="text-[#999999] text-sm">Henüz haber yok. İlk haberi ekleyin.</p>
          <Button onClick={openCreate} variant="outline" className="mt-1">
            <Plus className="w-4 h-4 mr-2" />
            Haber Ekle
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-[#1f1f20] shrink-0 overflow-hidden flex items-center justify-center">
                  {item.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cover_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-[#999999]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#ffffff] font-medium text-sm truncate">{item.title}</p>
                  {item.excerpt && (
                    <p className="text-[#999999] text-xs mt-0.5 truncate">{item.excerpt}</p>
                  )}
                </div>

                {/* Date */}
                <span className="text-[#999999] text-xs shrink-0 hidden md:block">
                  {item.published_at ? formatDate(item.published_at) : '—'}
                </span>

                {/* Published badge */}
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:inline',
                    item.is_published
                      ? 'bg-[#2dd4bf]/15 text-[#2dd4bf]'
                      : 'bg-[#999999]/15 text-[#999999]'
                  )}
                >
                  {item.is_published ? 'Yayında' : 'Taslak'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    title={item.is_published ? 'Taslağa al' : 'Yayınla'}
                    className="p-1.5 text-[#999999] hover:text-[#ffffff] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.is_published
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    title="Düzenle"
                    className="p-1.5 text-[#999999] hover:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    title="Sil"
                    className="p-1.5 text-[#999999] hover:text-[#525252] hover:bg-[#525252]/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#161617] border-[rgba(229,231,235,0.08)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#ffffff]">
              {editingItem ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Başlık *</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Haber başlığı..."
                className="bg-[#1f1f20] border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999]"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Özet</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Kısa açıklama (liste görünümünde gösterilir)..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors resize-none"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">İçerik (Markdown destekli)</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Haber içeriği... **kalın**, *italik*, ## başlık desteklenir."
                rows={12}
                className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2dd4bf] transition-colors resize-y font-mono"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Kapak Görseli</label>
              {form.cover_image_url ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[rgba(229,231,235,0.08)] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.cover_image_url}
                    alt="kapak"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setForm(f => ({ ...f, cover_image_url: '' }))}
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-white hover:bg-black/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-[#1f1f20] border border-dashed border-[rgba(255,255,255,0.12)] cursor-pointer hover:border-[#2dd4bf]/50 transition-colors',
                    uploadingImage && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {uploadingImage
                    ? <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />
                    : <Upload className="w-5 h-5 text-[#999999]" />
                  }
                  <span className="text-[#999999] text-xs text-center">
                    {uploadingImage
                      ? 'Yükleniyor...'
                      : 'Görsel seç (JPG, PNG, WebP · max 10MB)'
                    }
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            {/* Is Published */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1f1f20]">
              <div>
                <p className="text-[#ffffff] text-sm font-medium">Yayınla</p>
                <p className="text-[#999999] text-xs">Kapalı olursa taslak olarak kaydedilir</p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
              className="border-[rgba(229,231,235,0.08)] text-[#999999] hover:text-[#ffffff]"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || uploadingImage}
              className="bg-[#2dd4bf] hover:bg-[#1d4ed8] text-white"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingItem ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm bg-[#161617] border-[rgba(229,231,235,0.08)]">
          <DialogHeader>
            <DialogTitle className="text-[#ffffff] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#525252]" />
              Haberi Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#999999] text-sm">
            <span className="text-[#ffffff] font-medium">&quot;{deleteTarget?.title}&quot;</span> haberini
            kalıcı olarak silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="border-[rgba(229,231,235,0.08)] text-[#999999] hover:text-[#ffffff]"
            >
              İptal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-[#525252] hover:bg-[#dc2626] text-white"
            >
              {isDeleting
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <Trash2 className="w-4 h-4 mr-2" />
              }
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
