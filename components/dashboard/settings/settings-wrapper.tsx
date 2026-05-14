'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, CreditCard, Key, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, Crown, Zap, Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { ApiKeyModal } from '@/components/console/api-key-modal'

interface Props {
  user: { id: string; email: string }
  profile: {
    full_name?: string
    username?: string
    avatar_url?: string
    subscription_tier?: string
    subscription_status?: string
    stripe_customer_id?: string
    created_at?: string
  } | null
  hasApiKey: boolean
  subParam?: string
}

const TIER_INFO: Record<string, { label: string; price: string; color: string; next?: string }> = {
  m1: { label: 'M1 — Başlangıç', price: '$9/ay', color: '#71717a', next: 'm2' },
  m2: { label: 'M2 — Profesyonel', price: '$17/ay', color: '#2563eb', next: 'm3' },
  m3: { label: 'M3 — B2B', price: '$45/ay', color: '#10b981' },
}

export function SettingsWrapper({ user, profile, hasApiKey: initialHasKey, subParam }: Props) {
  const [hasApiKey, setHasApiKey] = useState(initialHasKey)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [isPortalLoading, startPortal] = useTransition()
  const [isUpgradeLoading, startUpgrade] = useTransition()

  const tier = profile?.subscription_tier ?? 'm1'
  const status = profile?.subscription_status ?? 'inactive'
  const tierInfo = TIER_INFO[tier] ?? TIER_INFO.m1
  const isActive = status === 'active' || status === 'trial'
  const hasBilling = !!profile?.stripe_customer_id

  function handleOpenPortal() {
    startPortal(async () => {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Portal açılamadı.'); return }
      window.location.href = data.url
    })
  }

  function handleUpgrade(targetTier: string) {
    startUpgrade(async () => {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: targetTier }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Ödeme sayfası açılamadı.'); return }
      window.location.href = data.url
    })
  }

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#f4f4f5]">Ayarlar</h1>
            <p className="text-[#71717a] text-sm">Hesap ve abonelik yönetimi</p>
          </div>
        </div>

        {/* Ödeme sonucu banner */}
        {subParam === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0" />
            <div>
              <p className="text-[#f4f4f5] text-sm font-medium">Abonelik aktifleştirildi!</p>
              <p className="text-[#71717a] text-xs">Planınız güncellendi. Tüm özelliklere artık erişebilirsiniz.</p>
            </div>
          </motion.div>
        )}

        {/* Abonelik süresi dolmuş banner */}
        {!isActive && status === 'inactive' && tier !== 'm1' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="text-[#f4f4f5] text-sm font-medium">Aboneliğiniz pasif</p>
              <p className="text-[#71717a] text-xs">Ödeme başarısız olmuş olabilir. Aboneliği yenilemek için aşağıdan yönetin.</p>
            </div>
          </motion.div>
        )}

        {/* Profil Bilgileri */}
        <div className="p-5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-[#f4f4f5] font-medium">Profil</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-[#71717a] text-sm">E-posta</span>
              <span className="text-[#f4f4f5] text-sm font-mono">{user.email}</span>
            </div>
            {profile?.full_name && (
              <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#71717a] text-sm">Ad Soyad</span>
                <span className="text-[#f4f4f5] text-sm">{profile.full_name}</span>
              </div>
            )}
            {profile?.username && (
              <div className="flex items-center justify-between py-2">
                <span className="text-[#71717a] text-sm">Kullanıcı adı</span>
                <span className="text-[#f4f4f5] text-sm">@{profile.username}</span>
              </div>
            )}
          </div>
        </div>

        {/* Abonelik Durumu */}
        <div className="p-5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-[#f4f4f5] font-medium">Abonelik</h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a1f] mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `${tierInfo.color}20` }}
              >
                <Crown className="w-4 h-4" style={{ color: tierInfo.color }} />
              </div>
              <div>
                <p className="text-[#f4f4f5] text-sm font-medium">{tierInfo.label}</p>
                <p className="text-[#71717a] text-xs">{tierInfo.price}</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-[#10b981]/15 text-[#10b981]'
                : 'bg-[#ef4444]/15 text-[#ef4444]'
            }`}>
              {status === 'trial' ? 'Deneme' : isActive ? 'Aktif' : 'Pasif'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {hasBilling && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleOpenPortal}
                disabled={isPortalLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] text-sm hover:bg-white/5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPortalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Aboneliği Yönet (Stripe Portal)
              </motion.button>
            )}

            {tierInfo.next && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleUpgrade(tierInfo.next!)}
                disabled={isUpgradeLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2563eb] text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {isUpgradeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {tierInfo.next === 'm2' ? 'M2\'ye Yükselt' : 'M3\'e Yükselt'}
              </motion.button>
            )}
          </div>
        </div>

        {/* API Key */}
        <div className="p-5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-[#f4f4f5] font-medium">Anthropic API Key</h2>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${
            hasApiKey
              ? 'bg-[#10b981]/10 border border-[#10b981]/20'
              : 'bg-[#f59e0b]/10 border border-[#f59e0b]/20'
          }`}>
            {hasApiKey ? (
              <>
                <Shield className="w-4 h-4 text-[#10b981] shrink-0" />
                <div>
                  <p className="text-[#10b981] text-sm font-medium">API Key aktif</p>
                  <p className="text-[#71717a] text-xs font-mono">sk-ant-••••••••••••••••</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <div>
                  <p className="text-[#f59e0b] text-sm font-medium">API Key eklenmemiş</p>
                  <p className="text-[#71717a] text-xs">D-Console ve Vaka Pratiği için gerekli</p>
                </div>
              </>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setApiKeyModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] text-sm hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4" />
            {hasApiKey ? 'API Key\'i Güncelle' : 'API Key Ekle'}
          </motion.button>
        </div>
      </div>

      <ApiKeyModal
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
        hasKey={hasApiKey}
        onKeySaved={() => setHasApiKey(true)}
      />
    </>
  )
}
