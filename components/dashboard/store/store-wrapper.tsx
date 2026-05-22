'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Plus, Minus, Trash2, X, ShoppingCart,
  Loader2, CheckCircle2, Package, Tag,
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
    <div className="min-h-full p-6 lg:p-8 bg-midnight-oil font-soehne-mono">
      {successParam && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-[26.5px] rounded-lg-099 bg-steel-gray border border-muted-ash flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-dim-gray shrink-0" />
          <div>
            <p className="text-ghost-white text-[16px] leading-[1.2] tracking-[0.24px]">Ödeme başarılı!</p>
            <p className="text-dim-gray text-[16px] leading-[1.2] tracking-[0.24px] mt-1">Siparişiniz alındı. Teşekkür ederiz.</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-dim-gray" />
          <div>
            <h1 className="text-ghost-white text-[16px] leading-[1.2] tracking-[0.24px]">Mağaza</h1>
            <p className="text-dim-gray text-[16px] leading-[1.2] tracking-[0.24px]">Diş teknolojisi ürünleri</p>
          </div>
        </div>

        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 px-[25.6px] py-19 rounded-lg-099 border border-muted-ash bg-transparent text-ghost-white text-[16px] tracking-[0.24px] hover:bg-steel-gray transition-colors duration-200 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          Cart {cartCount > 0 ? cartCount : 0}
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg-099 bg-ghost-white text-midnight-oil text-xs flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-[25.6px] py-19 rounded-lg-099 text-[16px] tracking-[0.24px] transition-colors duration-200 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-steel-gray text-ghost-white border-none'
                : 'border border-muted-ash text-dim-gray hover:text-ghost-white hover:bg-steel-gray'
            }`}
          >
            {cat === 'all' ? 'Show All' : (CATEGORY_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-8 h-8 mx-auto mb-3 text-muted-ash" />
          <p className="text-dim-gray text-[16px] tracking-[0.24px]">Bu kategoride ürün bulunamadı.</p>
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
                transition={{ delay: i * 0.05 }}
                className="p-[26.5px] rounded-lg-099 bg-steel-gray flex flex-col"
              >
                {product.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg-099 mb-4"
                  />
                ) : (
                  <div className="w-full h-40 rounded-lg-099 mb-4 bg-muted-ash flex items-center justify-center">
                    <Package className="w-8 h-8 text-dim-gray" />
                  </div>
                )}

                <div className="flex items-start gap-2 mb-2">
                  {product.category && (
                    <span className="flex items-center gap-1 text-[16px] text-dim-gray border border-muted-ash px-2 py-0.5 rounded-lg-099 tracking-[0.24px]">
                      <Tag className="w-3 h-3" />
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                  )}
                  {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                    <span className="text-[16px] text-dim-gray border border-muted-ash px-2 py-0.5 rounded-lg-099 tracking-[0.24px]">
                      Son {product.stock} adet
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="text-[16px] text-dim-gray border border-muted-ash px-2 py-0.5 rounded-lg-099 tracking-[0.24px]">
                      Tükendi
                    </span>
                  )}
                </div>

                <h3 className="text-ghost-white text-[16px] leading-[1.2] tracking-[0.24px] mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-dim-gray text-[16px] leading-[1.4] tracking-[0.24px] mb-4 line-clamp-2 flex-1">{product.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-muted-ash">
                  <span className="text-ghost-white text-[16px] tracking-[0.24px]">${product.price.toFixed(2)}</span>
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(product.id, -1)}
                        className="w-8 h-8 rounded-lg-099 border border-muted-ash flex items-center justify-center text-dim-gray hover:text-ghost-white hover:bg-muted-ash transition-colors duration-200 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-ghost-white text-[16px] w-4 text-center tracking-[0.24px]">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, 1)}
                        className="w-8 h-8 rounded-lg-099 border border-muted-ash flex items-center justify-center text-dim-gray hover:text-ghost-white hover:bg-muted-ash transition-colors duration-200 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="flex items-center gap-1.5 px-[25.6px] py-19 rounded-lg-099 bg-ghost-white text-midnight-oil text-[16px] tracking-[0.24px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e0e0e0] transition-colors duration-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
              className="fixed inset-0 z-40 bg-black/80"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-xs sm:max-w-sm z-50 bg-midnight-oil border-l border-muted-ash flex flex-col font-soehne-mono"
            >
              <div className="flex items-center justify-between px-[26.5px] py-19 border-b border-muted-ash">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-ghost-white" />
                  <p className="text-ghost-white text-[16px] tracking-[0.24px]">Sepetim</p>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-lg-099 bg-steel-gray text-dim-gray text-[16px] tracking-[0.24px]">
                      {cartCount} ürün
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-dim-gray hover:text-ghost-white transition-colors duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-[26.5px] space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-muted-ash" />
                    <p className="text-dim-gray text-[16px] tracking-[0.24px]">Sepetiniz boş.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-[19.2px] rounded-lg-099 bg-steel-gray">
                      <div className="w-12 h-12 rounded-lg-099 bg-muted-ash flex items-center justify-center shrink-0">
                        {item.image_urls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_urls[0]} alt={item.name} className="w-full h-full object-cover rounded-lg-099" />
                        ) : (
                          <Package className="w-5 h-5 text-dim-gray" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ghost-white text-[16px] tracking-[0.24px] truncate">{item.name}</p>
                        <p className="text-dim-gray text-[16px] tracking-[0.24px]">${item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 rounded-lg-099 border border-muted-ash flex items-center justify-center text-dim-gray hover:text-ghost-white hover:bg-muted-ash transition-colors duration-200 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-ghost-white text-[16px] w-4 text-center tracking-[0.24px]">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 rounded-lg-099 border border-muted-ash flex items-center justify-center text-dim-gray hover:text-ghost-white hover:bg-muted-ash transition-colors duration-200 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-1 p-1 text-dim-gray hover:text-ghost-white transition-colors duration-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-[26.5px] py-19 border-t border-muted-ash space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dim-gray text-[16px] tracking-[0.24px]">Toplam</span>
                    <span className="text-ghost-white text-[16px] tracking-[0.24px]">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full flex items-center justify-center gap-2 py-19 rounded-lg-099 bg-ghost-white text-midnight-oil text-[16px] tracking-[0.24px] disabled:opacity-50 hover:bg-[#e0e0e0] transition-colors duration-200 cursor-pointer"
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
