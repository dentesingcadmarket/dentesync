'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, Globe } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })

    if (error) {
      setError('Google ile giriş sırasında bir hata oluştu.')
      setGoogleLoading(false)
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Lütfen önce e-posta adresinizi girin.')
      return
    }
    setMagicLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })

    if (error) {
      setError('Magic link gönderilemedi. Lütfen tekrar deneyin.')
      setMagicLoading(false)
      return
    }

    setMagicSent(true)
    setMagicLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Image src="/logo.png" alt="DenteSync" width={36} height={36} className="rounded-lg" />
          <span className="text-[#f4f4f5] font-semibold text-lg">DenteSync</span>
        </div>
        <h1 className="text-2xl font-semibold text-[#f4f4f5]">Tekrar hoş geldiniz</h1>
        <p className="text-[#71717a] mt-1 text-sm">Hesabınıza giriş yapın</p>
      </div>

      {/* Kart */}
      <div className="bg-[#111114] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8">
        {magicSent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#10b981]" />
            </div>
            <p className="text-[#f4f4f5] font-medium">Magic link gönderildi!</p>
            <p className="text-[#71717a] text-sm mt-2">
              <span className="text-[#f4f4f5]">{email}</span> adresine bağlantı gönderdik.
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="text-[#2563eb] text-sm mt-4 hover:underline"
            >
              Geri dön
            </button>
          </motion.div>
        ) : (
          <>
            {/* Google */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] bg-transparent text-[#f4f4f5] text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              Google ile devam et
            </motion.button>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-[rgba(255,255,255,0.07)]" />
              <span className="text-[#71717a] text-xs">veya</span>
              <div className="h-px flex-1 bg-[rgba(255,255,255,0.07)]" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#f4f4f5] text-sm">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ad@ornek.com"
                    className="pl-10 bg-[#1a1a1f] border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] focus:border-[#2563eb] focus:ring-[#2563eb]/20 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#f4f4f5] text-sm">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-[#1a1a1f] border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] focus:border-[#2563eb] focus:ring-[#2563eb]/20 rounded-xl"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Giriş Yap
              </motion.button>
            </form>

            <button
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="w-full mt-3 text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {magicLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              Magic link ile giriş yap
            </button>
          </>
        )}
      </div>

      <p className="text-center text-[#71717a] text-sm mt-6">
        Hesabınız yok mu?{' '}
        <Link href="/signup" className="text-[#2563eb] hover:underline">
          Ücretsiz başlayın
        </Link>
      </p>
    </motion.div>
  )
}
