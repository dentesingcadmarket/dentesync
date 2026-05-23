'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Terminal, FolderOpen, BookOpen, Users, TrendingUp, CheckCircle2,
  AlertCircle, Zap, Clock, ArrowRight, Sparkles,
} from 'lucide-react'

import { WelcomeCard } from './widgets/welcome-card'
import { StatCardSparkline } from './widgets/stat-card-sparkline'
import { QuickAccessCard } from './widgets/quick-access-card'
import { StatusDonut, StatusDonutLegend } from './widgets/status-donut'
import { ActivityBars } from './widgets/activity-bars'
import { MiniListCard } from './widgets/mini-list-card'
import { DataTable, PatientAvatar } from './widgets/data-table'
import { EmptyState } from './widgets/empty-state'
import { StatusBadge } from './widgets/status-badge'

interface Props {
  name: string | null
  tier: 'm1' | 'm2' | 'm3'
  memberSince: string | null
  cases: Array<{ id: string; status: string; created_at: string; title?: string }>
  recentSessions: Array<{ id: string; updated_at: string }>
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

// 7 günlük trend datası üret — gerçek case oluşturma tarihlerinden
function buildTrend(items: Array<{ created_at: string }>, days = 7) {
  const buckets = new Array(days).fill(0)
  const now = Date.now()
  for (const it of items) {
    const d = Math.floor((now - new Date(it.created_at).getTime()) / 86400000)
    if (d >= 0 && d < days) buckets[days - 1 - d]++
  }
  return buckets.map(v => ({ v }))
}

function buildActivity(items: Array<{ updated_at: string }>, days = 7) {
  const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  const today = new Date()
  const result: Array<{ day: string; v: number }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const startMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const endMs = startMs + 86400000
    const count = items.filter(it => {
      const t = new Date(it.updated_at).getTime()
      return t >= startMs && t < endMs
    }).length
    result.push({ day: labels[d.getDay() === 0 ? 6 : d.getDay() - 1], v: count })
  }
  return result
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
}

export function DashboardHome({ name, tier, memberSince, cases, recentSessions }: Props) {
  const openCases = cases.filter(c => c.status === 'open').length
  const inProgressCases = cases.filter(c => c.status === 'in_progress').length
  const completedCases = cases.filter(c => c.status === 'completed').length
  const totalCases = cases.length

  const trendAll = buildTrend(cases)
  const trendOpen = buildTrend(cases.filter(c => c.status === 'open'))
  const trendProgress = buildTrend(cases.filter(c => c.status === 'in_progress'))
  const trendDone = buildTrend(cases.filter(c => c.status === 'completed'))

  const activityData = buildActivity(recentSessions)

  const last7Total = trendAll.slice(-7).reduce((a, b) => a + b.v, 0)
  const prev7Total = Math.max(0, totalCases - last7Total)
  const trendPct = prev7Total > 0 ? Math.round(((last7Total - prev7Total) / prev7Total) * 100) : last7Total > 0 ? 100 : 0

  const donutData = [
    { name: 'Açık', value: openCases, color: '#2dd4bf' },
    { name: 'Devam Eden', value: inProgressCases, color: '#2563eb' },
    { name: 'Tamamlanan', value: completedCases, color: '#22c55e' },
  ]

  const quickLinks = [
    { href: '/dashboard/search/console', icon: Terminal, label: 'D-Console', desc: 'AI asistanınla sohbet et', color: '#2dd4bf' },
    { href: '/dashboard/case-management', icon: FolderOpen, label: 'Vaka Yönetimi', desc: 'Vakalarını yönet', color: '#2563eb' },
    { href: '/dashboard/case-practice', icon: BookOpen, label: 'Vaka Pratiği', desc: 'Senaryolarla pratik yap', color: '#22c55e', locked: tier === 'm1', badge: tier === 'm1' ? 'M2+' : undefined },
    { href: '/dashboard/community', icon: Users, label: 'Topluluk', desc: 'Meslektaşlarınla bağlan', color: '#a78bfa' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* WELCOME */}
      <WelcomeCard
        greeting={getGreeting()}
        name={name}
        subtitle="DenteSync Dashboard — bugün ne üzerinde çalışıyoruz?"
        tier={tier}
        memberSince={memberSince}
        miniStats={[
          { label: 'Yeni vaka', value: trendAll.slice(-7).reduce((a, b) => a + b.v, 0) },
          { label: 'Devam Eden', value: inProgressCases },
          { label: 'Tamamlanan', value: completedCases },
        ]}
      />

      {/* STATS ROW */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <motion.div variants={stagger.item}>
          <StatCardSparkline
            label="Toplam Vaka"
            value={totalCases}
            icon={FolderOpen}
            color="#2dd4bf"
            trend={trendPct}
            data={trendAll}
            subtitle="son 7 gün"
          />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StatCardSparkline
            label="Açık"
            value={openCases}
            icon={AlertCircle}
            color="#fbbf24"
            data={trendOpen}
            subtitle={openCases === 0 ? 'henüz yok' : 'bekliyor'}
          />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StatCardSparkline
            label="Devam Eden"
            value={inProgressCases}
            icon={TrendingUp}
            color="#2563eb"
            data={trendProgress}
            subtitle={inProgressCases === 0 ? 'henüz yok' : 'aktif'}
          />
        </motion.div>
        <motion.div variants={stagger.item}>
          <StatCardSparkline
            label="Tamamlanan"
            value={completedCases}
            icon={CheckCircle2}
            color="#22c55e"
            data={trendDone}
            subtitle={completedCases === 0 ? 'henüz yok' : 'tamam'}
          />
        </motion.div>
      </motion.div>

      {/* HIZLI ERİŞİM */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-medium text-sm flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
            Hızlı Erişim
          </h2>
        </div>
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {quickLinks.map(link => (
            <motion.div key={link.href} variants={stagger.item}>
              <QuickAccessCard
                href={link.href}
                icon={link.icon}
                label={link.label}
                desc={link.desc}
                color={link.color}
                locked={link.locked}
                badge={link.badge}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* DONUT + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vaka Dağılımı (donut) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-medium">Vaka Dağılımı</h3>
            <span className="text-[10px] text-[#737373]">Tüm zamanlar</span>
          </div>
          <div className="flex items-center gap-5">
            <StatusDonut data={donutData} total={totalCases} centerLabel="vaka" />
            <div className="flex-1 min-w-0">
              <StatusDonutLegend data={donutData} />
            </div>
          </div>
        </motion.div>

        {/* D-Console Aktivitesi (chart + list) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-sm font-medium">D-Console Aktivitesi</h3>
              <p className="text-[#737373] text-[10px] mt-0.5">Son 7 gün</p>
            </div>
            <Link href="/dashboard/search/console" className="text-[#2dd4bf] text-xs hover:underline">
              Aç
            </Link>
          </div>
          <ActivityBars data={activityData} color="#2dd4bf" height={130} />
          <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
            {recentSessions.length === 0 ? (
              <p className="text-[#737373] text-xs text-center py-2">Henüz sohbet yok</p>
            ) : (
              recentSessions.slice(0, 3).map((s, i) => (
                <Link
                  key={s.id}
                  href="/dashboard/search/console"
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#2dd4bf]/12 flex items-center justify-center shrink-0">
                      <Zap className="w-3 h-3 text-[#2dd4bf]" />
                    </div>
                    <span className="text-white text-xs">Sohbet #{i + 1}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[#737373] text-[10px]">
                    <Clock className="w-2.5 h-2.5" />
                    {relativeTime(s.updated_at)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* SON VAKALAR — tablo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white text-sm font-medium">Son Vakalar</h3>
            <p className="text-[#737373] text-[10px] mt-0.5">{totalCases} kayıt</p>
          </div>
          <Link href="/dashboard/case-management" className="text-[#2dd4bf] text-xs hover:underline inline-flex items-center gap-1">
            Tümü <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {cases.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Henüz vaka yok"
            subtitle="İlk vakanı oluştur ve dosyalarını eklemeye başla."
            ctaLabel="İlk vakayı oluştur →"
            ctaHref="/dashboard/case-management"
          />
        ) : (
          <DataTable
            data={cases.slice(0, 6)}
            rowKey={c => c.id}
            columns={[
              {
                key: 'id',
                header: 'Vaka',
                cell: c => (
                  <div className="flex items-center gap-3">
                    <PatientAvatar
                      name={c.title || c.id}
                      color={c.status === 'completed' ? '#22c55e' : c.status === 'in_progress' ? '#2563eb' : '#2dd4bf'}
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate max-w-[240px]">
                        {c.title || `Vaka #${c.id.slice(0, 8)}`}
                      </p>
                      <p className="text-[#737373] text-[10px] font-mono">#{c.id.slice(0, 8)}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Durum',
                cell: c => <StatusBadge status={c.status as 'open' | 'in_progress' | 'completed' | 'archived'} />,
              },
              {
                key: 'date',
                header: 'Oluşturuldu',
                align: 'right',
                cell: c => <span className="text-[#999999] text-xs">{relativeTime(c.created_at)}</span>,
              },
            ]}
            rowHref={c => `/dashboard/case-management/${c.id}`}
          />
        )}
      </motion.div>

      {/* M1 UPGRADE BANNER */}
      {tier === 'm1' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-5 py-4 border border-[#2dd4bf]/20 bg-gradient-to-r from-[#2dd4bf]/10 via-[#2dd4bf]/5 to-transparent"
        >
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#2dd4bf]/10 blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-white text-sm font-medium">M2 Pro&apos;ya yükseltin</p>
            <p className="text-[#999999] text-xs mt-0.5">Vaka Pratiği, gelişmiş D-Console ve daha fazlasına erişin.</p>
          </div>
          <Link
            href="/dashboard/settings"
            className="relative shrink-0 px-4 py-2 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-xs font-semibold hover:bg-[#5eead4] transition-colors"
          >
            Planı Yükselt
          </Link>
        </motion.div>
      )}
    </div>
  )
}
