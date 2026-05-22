'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const PLANS = [
  {
    id: 'm2',
    name: 'M2 — Profesyonel',
    price: '$17/ay',
    features: [
      'Tam D-Console erişimi',
      'Vaka Pratiği (AI destekli)',
      'Topluluk yazma & yorum',
      'Gelişmiş AI analizleri',
      'Planım tam erişim',
    ],
  },
  {
    id: 'm3',
    name: 'M3 — B2B',
    price: '$45/ay',
    features: [
      'Çok kullanıcı desteği',
      'Öncelikli destek',
      'Özel entegrasyonlar',
      'SLA garantisi',
      "Tüm M2 özellikleri",
    ],
  },
]

export function UpgradeModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [isLoading, startLoading] = useTransition()

  const requiredTier = searchParams.get('requiredTier') ?? 'm2'
  const isUpgrade = searchParams.get('upgrade') === 'true'

  useEffect(() => {
    if (isUpgrade) setOpen(true)
  }, [isUpgrade])

  function handleClose() {
    setOpen(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('upgrade')
    url.searchParams.delete('requiredTier')
    router.replace(url.pathname)
  }

  function handleUpgrade() {
    startLoading(async () => {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: requiredTier }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Ödeme sayfası açılamadı.'); return }
      window.location.href = data.url
    })
  }

  const plan = PLANS.find(p => p.id === requiredTier) ?? PLANS[0]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#161617] border-[rgba(229,231,235,0.08)] text-[#ffffff] max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#2563eb]" />
            </div>
            <DialogTitle className="text-[#ffffff]">Plan Yükseltme Gerekli</DialogTitle>
          </div>
          <p className="text-[#999999] text-sm">
            Bu özelliği kullanmak için <span className="text-[#ffffff] font-medium">{plan.name}</span> planına geçmeniz gerekiyor.
          </p>
        </DialogHeader>

        <div className="bg-[#1f1f20] rounded-xl p-4 border border-[rgba(229,231,235,0.08)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#ffffff] font-medium">{plan.name}</span>
            <span className="text-[#2563eb] font-semibold">{plan.price}</span>
          </div>
          <ul className="space-y-2">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#999999]">
                <Check className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] text-sm hover:bg-white/5 transition-colors"
          >
            Vazgeç
          </button>
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            onClick={handleUpgrade}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2563eb] text-white text-sm font-medium disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Planı Yükselt
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
