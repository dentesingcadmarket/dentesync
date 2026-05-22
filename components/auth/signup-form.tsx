'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2, Globe, Check } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'm1',
    name: 'M1',
    price: '$9/ay',
    description: 'Başlangıç',
    features: ['D-Console temel', 'Topluluk okuma'],
  },
  {
    id: 'm2',
    name: 'M2',
    price: '$17/ay',
    description: 'Profesyonel',
    features: ['Tam erişim', 'Vaka Pratiği', 'Topluluk yazma'],
    recommended: true,
  },
  {
    id: 'm3',
    name: 'M3',
    price: '$45/ay',
    description: 'B2B',
    features: ['Çok kullanıcı', 'Öncelikli destek'],
  },
] as const

export default function SignupForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'m1' | 'm2' | 'm3'>('m2')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError('Google ile kayıt sırasında bir hata oluştu.')
      setGoogleLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          subscription_tier: selectedPlan,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Bu e-posta adresi zaten kayıtlı.'
        : 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-nightfall-gray border border-outline-haze/[0.08] rounded-cards p-10">
          <div className="w-16 h-16 rounded-pill bg-morphic-blue/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-morphic-blue" />
          </div>
          <h2 className="text-[22px] font-bold tracking-tight text-cloud-white mb-2">Hesabınız oluşturuldu!</h2>
          <p className="text-muted-silver text-body">
            <span className="text-cloud-white">{email}</span> adresine doğrulama bağlantısı gönderdik.
            Lütfen e-postanızı kontrol edin.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Image src="/logo.png" alt="DenteSync" width={36} height={36} className="rounded-buttons" />
          <span className="text-cloud-white font-semibold text-body-lg tracking-tight">DenteSync</span>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-cloud-white">Hesap oluşturun</h1>
        <p className="text-muted-silver mt-1 text-body">14 gün ücretsiz deneyin</p>
      </div>

      <div className="bg-nightfall-gray border border-outline-haze/[0.08] rounded-cards p-8">
        {step === 1 ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-buttons border border-outline-haze/[0.08] bg-transparent text-cloud-white text-body font-medium hover:bg-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Google ile kayıt ol
            </motion.button>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-outline-haze/[0.08]" />
              <span className="text-muted-silver text-caption">veya</span>
              <div className="h-px flex-1 bg-outline-haze/[0.08]" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-cloud-white text-body">Ad Soyad</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-silver" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="pl-10 bg-charcoal-surface border-outline-haze/[0.08] text-cloud-white placeholder:text-muted-silver focus:border-morphic-blue focus:ring-morphic-blue/20 rounded-inputs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-cloud-white text-body">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-silver" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ad@ornek.com"
                    className="pl-10 bg-charcoal-surface border-outline-haze/[0.08] text-cloud-white placeholder:text-muted-silver focus:border-morphic-blue focus:ring-morphic-blue/20 rounded-inputs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-cloud-white text-body">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-silver" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="En az 8 karakter"
                    className="pl-10 bg-charcoal-surface border-outline-haze/[0.08] text-cloud-white placeholder:text-muted-silver focus:border-morphic-blue focus:ring-morphic-blue/20 rounded-inputs"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!email || !password) { setError('Lütfen tüm alanları doldurun.'); return }
                  setError('')
                  setStep(2)
                }}
                className="w-full px-4 py-2.5 rounded-buttons bg-morphic-blue text-cloud-white text-body font-medium hover:bg-morphic-blue-hover transition-colors cursor-pointer"
              >
                Devam Et
              </motion.button>

              {error && <p className="text-anchor-graphite text-body">{error}</p>}
            </div>
          </>
        ) : (
          <form onSubmit={handleSignup}>
            <h3 className="text-cloud-white font-semibold tracking-tight mb-4">Plan seçin</h3>
            <div className="space-y-3 mb-6">
              {PLANS.map(plan => (
                <motion.button
                  key={plan.id}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-inputs border transition-all cursor-pointer',
                    selectedPlan === plan.id
                      ? 'border-morphic-blue bg-morphic-blue/10'
                      : 'border-outline-haze/[0.08] hover:border-white/20'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-cloud-white font-medium">{plan.name}</span>
                        {'recommended' in plan && plan.recommended && (
                          <span className="text-caption px-2 py-0.5 rounded-pill bg-morphic-blue/20 text-morphic-blue">
                            Önerilen
                          </span>
                        )}
                      </div>
                      <p className="text-muted-silver text-caption mt-0.5">{plan.description}</p>
                    </div>
                    <span className="text-cloud-white text-body font-medium">{plan.price}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {plan.features.map(f => (
                      <li key={f} className="text-muted-silver text-caption flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-morphic-blue" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-anchor-graphite text-body mb-4">
                {error}
              </motion.p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 rounded-buttons border border-outline-haze/[0.08] text-cloud-white text-body hover:bg-white/[0.06] transition-colors"
              >
                Geri
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-buttons bg-morphic-blue text-cloud-white text-body font-medium hover:bg-morphic-blue-hover transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Kayıt Ol
              </motion.button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-muted-silver text-body mt-6">
        Zaten hesabınız var mı?{' '}
        <Link href="/login" className="text-morphic-blue hover:underline">
          Giriş yapın
        </Link>
      </p>
    </motion.div>
  )
}
