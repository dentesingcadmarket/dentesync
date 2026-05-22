'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { StoreProduct } from '@/lib/supabase/types'

const CATEGORY_LABELS: Record<string, string> = {
  malzeme: 'Malzeme',
  alet: 'Alet & Ekipman',
  yazilim: 'Yazılım',
  egitim: 'Eğitim',
  diger: 'Diğer',
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  is_active: true,
  image_urls: [] as string[],
  stripe_price_id: '',
}

type FormState = typeof EMPTY_FORM

interface Props {
  initialProducts: StoreProduct[]
}

export function ProductManager({ initialProducts }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StoreProduct | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [isSaving, startSave] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openCreate() {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(product: StoreProduct) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      category: product.category ?? '',
      stock: product.stock != null ? String(product.stock) : '',
      is_active: product.is_active,
      image_urls: product.image_urls ?? [],
      stripe_price_id: product.stripe_price_id ?? '',
    })
    setDialogOpen(true)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" 10MB sınırını aşıyor.`)
        continue
      }
      const ext = file.type.split('/')[1] ?? 'jpg'
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: uploadError } = await (supabase as any).storage
        .from('store-images')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        toast.error(`Görsel yüklenemedi: ${uploadError.message}`)
        continue
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: urlData } = (supabase as any).storage
        .from('store-images')
        .getPublicUrl(path)

      newUrls.push(urlData.publicUrl)
    }

    setForm(f => ({ ...f, image_urls: [...f.image_urls, ...newUrls] }))
    setUploadingImages(false)

    // Reset input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(url: string) {
    setForm(f => ({ ...f, image_urls: f.image_urls.filter(u => u !== url) }))
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error('Ürün adı zorunludur.')
      return
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Geçerli bir fiyat giriniz.')
      return
    }

    startSave(async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        category: form.category || null,
        stock: form.stock !== '' ? Number(form.stock) : null,
        is_active: form.is_active,
        image_urls: form.image_urls,
        stripe_price_id: form.stripe_price_id.trim() || null,
      }

      const isEdit = !!editingProduct
      const url = isEdit
        ? `/api/admin/store/products/${editingProduct.id}`
        : '/api/admin/store/products'

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
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p))
        toast.success('Ürün güncellendi.')
      } else {
        setProducts(prev => [data.product, ...prev])
        toast.success('Ürün oluşturuldu.')
      }
      setDialogOpen(false)
      router.refresh()
    })
  }

  async function handleToggleActive(product: StoreProduct) {
    const previous = product.is_active
    setProducts(prev =>
      prev.map(p => p.id === product.id ? { ...p, is_active: !previous } : p)
    )

    const revert = () => setProducts(prev =>
      prev.map(p => p.id === product.id ? { ...p, is_active: previous } : p)
    )

    try {
      const res = await fetch(`/api/admin/store/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, is_active: !previous }),
      })
      if (!res.ok) {
        revert()
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Durum güncellenemedi.')
        return
      }
      router.refresh()
    } catch (err) {
      revert()
      console.error('[handleToggleActive]', err)
      toast.error('Ağ hatası. Tekrar deneyin.')
    }
  }

  function handleDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const res = await fetch(`/api/admin/store/products/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Silinemedi.')
        return
      }
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('Ürün silindi.')
      router.refresh()
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563eb]/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-[#ffffff] font-semibold text-lg leading-tight">Ürün Yönetimi</h1>
            <p className="text-[#999999] text-xs">{products.length} ürün</p>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
        >
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </Button>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1f1f20] flex items-center justify-center">
            <Package className="w-7 h-7 text-[#999999]" />
          </div>
          <p className="text-[#999999] text-sm">Henüz ürün yok. İlk ürünü ekleyin.</p>
          <Button onClick={openCreate} variant="outline" className="mt-1">
            <Plus className="w-4 h-4 mr-2" />
            Ürün Ekle
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {products.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg bg-[#1f1f20] shrink-0 overflow-hidden flex items-center justify-center">
                  {product.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_urls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-[#999999]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#ffffff] font-medium text-sm truncate">{product.name}</p>
                  <p className="text-[#999999] text-xs mt-0.5">
                    {CATEGORY_LABELS[product.category ?? ''] ?? product.category ?? '—'}
                  </p>
                </div>

                {/* Price */}
                <span className="text-[#ffffff] text-sm font-semibold shrink-0 hidden sm:block">
                  ${product.price.toFixed(2)}
                </span>

                {/* Stock */}
                <span className="text-[#999999] text-xs w-20 text-right shrink-0 hidden md:block">
                  {product.stock != null ? `${product.stock} adet` : 'Sınırsız'}
                </span>

                {/* Active badge */}
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:inline',
                    product.is_active
                      ? 'bg-[#2563eb]/15 text-[#2563eb]'
                      : 'bg-[#999999]/15 text-[#999999]'
                  )}
                >
                  {product.is_active ? 'Aktif' : 'Pasif'}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleActive(product)}
                    title={product.is_active ? 'Pasife al' : 'Aktife al'}
                    className="p-1.5 text-[#999999] hover:text-[#ffffff] hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {product.is_active
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => openEdit(product)}
                    title="Düzenle"
                    className="p-1.5 text-[#999999] hover:text-[#2563eb] hover:bg-[#2563eb]/10 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
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
        <DialogContent className="max-w-lg bg-[#161617] border-[rgba(229,231,235,0.08)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#ffffff]">
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Ürün Adı *</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ürün adı..."
                className="bg-[#1f1f20] border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Açıklama</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ürün açıklaması..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2563eb] transition-colors resize-none"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#999999] text-xs mb-1.5 block">Fiyat (USD) *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00"
                  className="bg-[#1f1f20] border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999]"
                />
              </div>
              <div>
                <label className="text-[#999999] text-xs mb-1.5 block">Stok (boş = sınırsız)</label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="Sınırsız"
                  className="bg-[#1f1f20] border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999]"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Kategori</label>
              <Select
                value={form.category}
                onValueChange={v => setForm(f => ({ ...f, category: v ?? '' }))}
              >
                <SelectTrigger className="w-full bg-[#1f1f20] border-[rgba(229,231,235,0.08)] text-[#ffffff]">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malzeme">Malzeme</SelectItem>
                  <SelectItem value="alet">Alet & Ekipman</SelectItem>
                  <SelectItem value="yazilim">Yazılım</SelectItem>
                  <SelectItem value="egitim">Eğitim</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stripe Price ID (optional) */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">Stripe Fiyat ID (opsiyonel)</label>
              <Input
                value={form.stripe_price_id}
                onChange={e => setForm(f => ({ ...f, stripe_price_id: e.target.value }))}
                placeholder="price_..."
                className="bg-[#1f1f20] border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] font-mono text-xs"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1f1f20]">
              <div>
                <p className="text-[#ffffff] text-sm font-medium">Aktif</p>
                <p className="text-[#999999] text-xs">Pasif ürünler mağazada görünmez</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-[#999999] text-xs mb-1.5 block">
                Görseller ({form.image_urls.length} adet)
              </label>
              <label
                className={cn(
                  'flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-[#1f1f20] border border-dashed border-[rgba(255,255,255,0.12)] cursor-pointer hover:border-[#2563eb]/50 transition-colors',
                  uploadingImages && 'opacity-60 cursor-not-allowed'
                )}
              >
                {uploadingImages
                  ? <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />
                  : <Upload className="w-5 h-5 text-[#999999]" />
                }
                <span className="text-[#999999] text-xs text-center">
                  {uploadingImages
                    ? 'Yükleniyor...'
                    : 'Görsel seç veya sürükle (JPG, PNG, WebP · max 10MB)'
                  }
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  disabled={uploadingImages}
                />
              </label>

              {/* Image Previews */}
              {form.image_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.image_urls.map(url => (
                    <div
                      key={url}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-[rgba(229,231,235,0.08)] group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(url)}
                        type="button"
                        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={isSaving || uploadingImages}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingProduct ? 'Güncelle' : 'Oluştur'}
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
              Ürünü Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#999999] text-sm">
            <span className="text-[#ffffff] font-medium">&quot;{deleteTarget?.name}&quot;</span> ürününü
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
