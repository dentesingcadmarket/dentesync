'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Terminal, FolderOpen, BookOpen, Users, ArrowRight,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Zap,
} from 'lucide-react'

interface Props {
  name: string | null
  tier: 'm1' | 'm2' | 'm3'
  memberSince: string | null
  cases: Array<{ id: string; status: string; created_at: string }>
  recentSessions: Array<{ id: string; updated_at: string }>
}

const tierLabel: Record<string, string> = { m1: 'M1 Başlangıç', m2: 'M2 Pro', m3: 'M3 İşletme' }
const tierColor: Record<string, string> = {
  m1: 'text-[#999999] bg-white/5',
  m2: 'text-[#2563eb] bg-[#2563eb]/10',
  m3: 'text-[#2563eb] bg-[#2563eb]/10',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} dk önce`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} sa önce`
  return `${Math.floor(hrs / 24)} gün önce`
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
}

export function DashboardHome({ name, tier, memberSince, cases, recentSessions }: Props) {
  const openCases = cases.filter(c => c.status === 'open').length
  const inProgressCases = cases.filter(c => c.status === 'in_progress').length
  const completedCases = cases.filter(c => c.status === 'completed').length

  const quickLinks = [
    { href: '/dashboard/search/console', icon: Terminal, label: 'D-Console', desc: 'AI asistanınla sohbet et', color: '#2563eb' },
    { href: '/dashboard/case-management', icon: FolderOpen, label: 'Vaka Yönetimi', desc: 'Vakalarını yönet', color: '#2563eb' },
    { href: '/dashboard/case-practice', icon: BookOpen, label: 'Vaka Pratiği', desc: 'Senaryolarla pratik yap', color: '#999999', locked: tier === 'm1' },
    { href: '/dashboard/community', icon: Users, label: 'Topluluk', desc: 'Meslektaşlarınla bağlan', color: '#2563eb' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Karşılama */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[#ffffff]">
            {getGreeting()}{name ? `, ${name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-[#999999] mt-1 text-sm">
            DenteSync Dashboard — bugün ne üzerinde çalışıyoruz?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${tierColor[tier]}`}>
            {tierLabel[tier]}
          </span>
          {memberSince && (
            <span className="text-[#999999] text-xs">
              Üye: {new Date(memberSince).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </motion.div>

      {/* İstatistik kartları */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          { label: 'Toplam Vaka', value: cases.length, icon: FolderOpen, color: '#2563eb' },
          { label: 'Açık', value: openCases, icon: AlertCircle, color: '#999999' },
          { label: 'Devam Eden', value: inProgressCases, icon: TrendingUp, color: '#2563eb' },
          { label: 'Tamamlanan', value: completedCases, icon: CheckCircle2, color: '#2563eb' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            variants={stagger.item}
            className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#999999] text-xs">{stat.label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#ffffff]">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Hızlı erişim */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-[#ffffff] font-medium mb-3 text-sm">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map(link => (
            <motion.div key={link.href} variants={stagger.item}>
              <Link
                href={link.locked ? '/dashboard?upgrade=true' : link.href}
                className="group relative flex flex-col gap-3 bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.14)] rounded-2xl p-4 transition-all"
              >
                {link.locked && (
                  <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[#999999]/15 text-[#999999]">M2+</span>
                )}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${link.color}18` }}>
                  <link.icon className="w-4 h-4" style={{ color: link.color }} />
                </div>
                <div>
                  <p className="text-[#ffffff] text-sm font-medium group-hover:text-white transition-colors">{link.label}</p>
                  <p className="text-[#999999] text-xs mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#ffffff] group-hover:translate-x-0.5 transition-all mt-auto" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Alt satır: Son vakalar + Son konsollar */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Son vakalar */}
        <motion.div variants={stagger.item} className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#ffffff] text-sm font-medium">Son Vakalar</h3>
            <Link href="/dashboard/case-management" className="text-[#2563eb] text-xs hover:underline">Tümü</Link>
          </div>
          {cases.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-8 h-8 text-[#999999] mx-auto mb-2" />
              <p className="text-[#999999] text-sm">Henüz vaka yok</p>
              <Link href="/dashboard/case-management" className="text-[#2563eb] text-xs mt-1 inline-block hover:underline">
                İlk vakayı oluştur →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {cases.slice(0, 5).map(c => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/case-management/${c.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1f1f20] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        c.status === 'completed' ? 'bg-[#2563eb]' :
                        c.status === 'in_progress' ? 'bg-[#2563eb]' :
                        c.status === 'open' ? 'bg-[#999999]' : 'bg-[#999999]'
                      }`} />
                      <span className="text-[#ffffff] text-xs font-mono">#{c.id.slice(0, 8)}</span>
                    </div>
                    <span className="text-[#999999] text-[10px]">{relativeTime(c.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* D-Console aktivitesi */}
        <motion.div variants={stagger.item} className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#ffffff] text-sm font-medium">D-Console Aktivitesi</h3>
            <Link href="/dashboard/search/console" className="text-[#2563eb] text-xs hover:underline">Aç</Link>
          </div>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <Terminal className="w-8 h-8 text-[#999999] mx-auto mb-2" />
              <p className="text-[#999999] text-sm">Henüz sohbet yok</p>
              <Link href="/dashboard/search/console" className="text-[#2563eb] text-xs mt-1 inline-block hover:underline">
                D-Console&apos;u aç →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentSessions.map((s, i) => (
                <li key={s.id}>
                  <Link
                    href="/dashboard/search/console"
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#1f1f20] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#2563eb]/10 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-[#2563eb]" />
                      </div>
                      <span className="text-[#ffffff] text-xs">Sohbet #{i + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#999999] text-[10px]">
                      <Clock className="w-3 h-3" />
                      {relativeTime(s.updated_at)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>

      {/* M1 upgrade banner */}
      {tier === 'm1' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-2xl px-5 py-4"
        >
          <div>
            <p className="text-[#ffffff] text-sm font-medium">M2 Pro&apos;ya yükseltin</p>
            <p className="text-[#999999] text-xs mt-0.5">Vaka Pratiği, gelişmiş D-Console ve daha fazlasına erişin.</p>
          </div>
          <Link
            href="/dashboard/settings"
            className="shrink-0 px-4 py-2 rounded-full bg-[#2563eb] text-white text-xs font-medium hover:bg-[#2563eb]/90 transition-colors"
          >
            Planı Yükselt
          </Link>
        </motion.div>
      )}
    </div>
  )
}
