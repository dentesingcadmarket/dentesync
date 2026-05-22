'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, User, CreditCard, CheckCircle2, AlertCircle,
  Loader2, Crown, Pencil, Save, X, Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile } from '@/app/actions/community'

interface Props {
  user: { id: string; email: string }
  profile: {
    full_name?: string
    username?: string
    avatar_url?: string
    subscription_tier?: string
    subscription_status?: string
    created_at?: string
  } | null
  subParam?: string
}

const TIER_INFO: Record<string, { label: string; color: string }> = {
  m1: { label: 'M1 — Başlangıç', color: '#999999' },
  m2: { label: 'M2 — Profesyonel', color: '#2563eb' },
  m3: { label: 'M3 — B2B', color: '#2563eb' },
}

export function SettingsWrapper({ user, profile, subParam }: Props) {
  const [isSavingProfile, startSaveProfile] = useTransition()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name ?? '',
    username: profile?.username ?? '',
  })
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const tier = profile?.subscription_tier ?? 'm1'
  const status = profile?.subscription_status ?? 'inactive'
  const tierInfo = TIER_INFO[tier] ?? TIER_INFO.m1
  const isActive = status === 'active' || status === 'trial'

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true)
    const previousAvatarUrl = currentAvatarUrl
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/community/upload-avatar', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error || 'Yükleme başarısız.'); return }

      const result = await updateProfile({ avatar_url: data.url })
      if (result.error) {
        // DB güncellemesi başarısız oldu — storage'a yüklenen orphan dosyayı temizle
        if (data.path) {
          fetch('/api/community/delete-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: data.path }),
          }).catch(err => console.error('[uploadAvatar:cleanup]', err))
        }
        setCurrentAvatarUrl(previousAvatarUrl)
        toast.error(result.error)
        return
      }

      setCurrentAvatarUrl(data.url)
      toast.success('Profil fotoğrafı güncellendi!')
    } catch (err) {
      console.error('[uploadAvatar]', err)
      setCurrentAvatarUrl(previousAvatarUrl)
      toast.error('Yükleme sırasında bir hata oluştu.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  function handleSaveProfile() {
    startSaveProfile(async () => {
      const result = await updateProfile({
        full_name: profileData.full_name,
        username: profileData.username,
      })
      if (result.error) { toast.error(result.error); return }
      toast.success('Profil güncellendi!')
      setEditingProfile(false)
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
            <h1 className="text-2xl font-semibold text-[#ffffff]">Ayarlar</h1>
            <p className="text-[#999999] text-sm">Hesap ve abonelik yönetimi</p>
          </div>
        </div>

        {/* Ödeme sonucu banner */}
        {subParam === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-[#2563eb] shrink-0" />
            <div>
              <p className="text-[#ffffff] text-sm font-medium">Abonelik aktifleştirildi!</p>
              <p className="text-[#999999] text-xs">Planınız güncellendi. Tüm özelliklere artık erişebilirsiniz.</p>
            </div>
          </motion.div>
        )}

        {/* Abonelik süresi dolmuş banner */}
        {!isActive && status === 'inactive' && tier !== 'm1' && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#525252]/10 border border-[#525252]/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#525252] shrink-0" />
            <div>
              <p className="text-[#ffffff] text-sm font-medium">Aboneliğiniz pasif</p>
              <p className="text-[#999999] text-xs">Plan yöneticinizle iletişime geçin.</p>
            </div>
          </motion.div>
        )}

        {/* Profil Bilgileri */}
        <div className="p-5 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#2563eb]" />
              <h2 className="text-[#ffffff] font-medium">Profil</h2>
            </div>
            {!editingProfile ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] text-xs hover:text-[#ffffff] hover:bg-white/5 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Düzenle
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingProfile(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] text-xs hover:bg-white/5 transition-colors"
                >
                  <X className="w-3 h-3" />
                  İptal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2563eb] text-white text-xs disabled:opacity-50 transition-colors"
                >
                  {isSavingProfile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Kaydet
                </motion.button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#2563eb]/20 flex items-center justify-center text-[#2563eb] text-2xl font-semibold overflow-hidden border-2 border-[#161617]">
                {currentAvatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  : (profileData.full_name || profile?.username || '?').charAt(0).toUpperCase()
                }
              </div>
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full hover:bg-black/50 transition-colors group">
                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
              </label>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {!editingProfile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#999999] text-sm">E-posta</span>
                <span className="text-[#ffffff] text-sm font-mono">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[#999999] text-sm">Ad Soyad</span>
                <span className="text-[#ffffff] text-sm">{profileData.full_name || <span className="text-[#999999] italic">Ayarlanmamış</span>}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#999999] text-sm">Kullanıcı adı</span>
                <span className="text-[#ffffff] text-sm">
                  {profileData.username ? `@${profileData.username}` : <span className="text-[#999999] italic">Ayarlanmamış</span>}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[#999999] text-xs mb-1.5 block">Ad Soyad</label>
                <input
                  value={profileData.full_name}
                  onChange={e => setProfileData(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Adınız Soyadınız"
                  className="w-full px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2563eb] transition-colors"
                />
              </div>
              <div>
                <label className="text-[#999999] text-xs mb-1.5 block">Kullanıcı Adı</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] text-sm">@</span>
                  <input
                    value={profileData.username}
                    onChange={e => setProfileData(p => ({ ...p, username: e.target.value }))}
                    placeholder="kullanici_adi"
                    maxLength={30}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2563eb] transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Abonelik Durumu */}
        <div className="p-5 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-4 h-4 text-[#2563eb]" />
            <h2 className="text-[#ffffff] font-medium">Abonelik</h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#1f1f20]">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `${tierInfo.color}20` }}
              >
                <Crown className="w-4 h-4" style={{ color: tierInfo.color }} />
              </div>
              <div>
                <p className="text-[#ffffff] text-sm font-medium">{tierInfo.label}</p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-[#2563eb]/15 text-[#2563eb]'
                : 'bg-[#525252]/15 text-[#525252]'
            }`}>
              {status === 'trial' ? 'Deneme' : isActive ? 'Aktif' : 'Pasif'}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
