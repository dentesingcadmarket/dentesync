'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Plus, Minus, Trash2, X, ShoppingCart,
  Loader2, CheckCircle2, Package, Tag, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import type { StoreProduct } from '@/lib/supabase/types'

interface CartItem extends StoreProduct {
  quantity: number
}

interface Props {
  products: StoreProduct[]
  successParam?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  malzeme: 'Malzeme',
  alet: 'Alet & Ekipman',
  yazilim: 'Yazılım',
  egitim: 'Eğitim',
  diger: 'Diğer',
}

export function StoreWrapper({ products, successParam }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCheckingOut, startCheckout] = useTransition()

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category ?? 'diger').filter(Boolean)))]

  const filtered = selectedCategory === 'all'
    ? products
    : products.filter(p => (p.category ?? 'diger') === selectedCategory)

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  function addToCart(product: StoreProduct) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        const max = product.stock ?? 99
        if (existing.quantity >= max) { toast.error('Stok limiti aşıldı.'); return prev }
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    toast.success(`${product.name} sepete eklendi.`)
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev => prev
      .map(i => i.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    )
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.id !== productId))
  }

  function handleCheckout() {
    if (!cart.length) return
    startCheckout(async () => {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Ödeme başlatılamadı.'); return }
      window.location.href = data.url
    })
  }

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {successParam && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/25 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Ödeme başarılı!</p>
            <p className="text-[#999999] text-xs mt-0.5">Siparişiniz alındı. Teşekkür ederiz.</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0f1716] via-[#161617] to-[#161617] p-5 lg:p-6">
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#2dd4bf]/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2dd4bf]/20 to-[#2dd4bf]/5 border border-[#2dd4bf]/25 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#2dd4bf]" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold flex items-center gap-2">
                Mağaza
                <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
              </h1>
              <p className="text-[#999999] text-sm mt-0.5">Diş teknolojisi ürünleri</p>
            </div>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] hover:border-[#2dd4bf]/30 bg-[#161617] hover:bg-[#2dd4bf]/5 text-white text-sm transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            Sepet
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-[10px] font-bold tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
              selectedCategory === cat
                ? 'bg-[#2dd4bf] text-[#0a0a0a] border-[#2dd4bf]'
                : 'border-white/[0.06] text-[#999999] hover:text-white hover:border-white/[0.14] bg-[#161617]'
            }`}
          >
            {cat === 'all' ? 'Tümü' : (CATEGORY_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#161617] border border-white/[0.06] rounded-2xl">
          <Package className="w-10 h-10 mx-auto mb-3 text-[#737373]" />
          <p className="text-[#999999] text-sm">Bu kategoride ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => {
            const inCart = cart.find(c => c.id === product.id)
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="group p-4 rounded-2xl bg-[#161617] border border-white/[0.06] hover:border-[#2dd4bf]/25 flex flex-col transition-all overflow-hidden"
              >
                {product.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-xl mb-4 group-hover:scale-[1.02] transition-transform"
                  />
                ) : (
                  <div className="w-full h-44 rounded-xl mb-4 bg-gradient-to-br from-[#0f1716] to-[#161617] border border-white/[0.04] flex items-center justify-center">
                    <Package className="w-10 h-10 text-[#525252]" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {product.category && (
                    <span className="flex items-center gap-1 text-[10px] text-[#2dd4bf] bg-[#2dd4bf]/10 border border-[#2dd4bf]/20 px-2 py-0.5 rounded-full font-medium">
                      <Tag className="w-2.5 h-2.5" />
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                  )}
                  {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                    <span className="text-[10px] text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20 px-2 py-0.5 rounded-full font-medium">
                      Son {product.stock} adet
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="text-[10px] text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2 py-0.5 rounded-full font-medium">
                      Tükendi
                    </span>
                  )}
                </div>

                <h3 className="text-white text-sm font-medium leading-snug mb-1.5 line-clamp-1">{product.name}</h3>
                {product.description && (
                  <p className="text-[#999999] text-xs leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
                  <span className="text-white text-base font-semibold tabular-nums">${product.price.toFixed(2)}</span>
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(product.id, -1)}
                        className="w-7 h-7 rounded-full border border-white/[0.08] flex items-center justify-center text-[#999999] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white text-sm w-4 text-center tabular-nums">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, 1)}
                        className="w-7 h-7 rounded-full border border-white/[0.08] flex items-center justify-center text-[#999999] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#5eead4] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Ekle
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-[#0a0a0a] border-l border-white/[0.08] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-[#2dd4bf]/8 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2dd4bf]/12 border border-[#2dd4bf]/20 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-[#2dd4bf]" />
                  </div>
                  <p className="text-white text-sm font-medium">Sepetim</p>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#2dd4bf]/15 text-[#2dd4bf] text-[10px] font-medium tabular-nums">
                      {cartCount} ürün
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#999999] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-[#525252]" />
                    <p className="text-[#999999] text-sm">Sepetiniz boş.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#161617] border border-white/[0.04]">
                      <div className="w-12 h-12 rounded-lg bg-[#0a0a0a] border border-white/[0.04] flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image_urls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_urls[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-[#737373]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-[#999999] text-xs mt-0.5 tabular-nums">${item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-full border border-white/[0.08] flex items-center justify-center text-[#999999] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-xs w-5 text-center tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-full border border-white/[0.08] flex items-center justify-center text-[#999999] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-1 p-1.5 rounded-full text-[#737373] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-5 py-4 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#999999] text-sm">Toplam</span>
                    <span className="text-white text-lg font-semibold tabular-nums">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-sm font-semibold disabled:opacity-50 hover:bg-[#5eead4] transition-colors cursor-pointer shadow-[0_0_24px_rgba(45,212,191,0.18)]"
                  >
                    {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                    Ödemeye Geç
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
