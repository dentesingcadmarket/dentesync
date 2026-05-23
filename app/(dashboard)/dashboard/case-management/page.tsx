import Link from 'next/link'
import { FolderOpen, Paperclip, FileText, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CaseForm } from '@/components/dashboard/case-form'
import { StatusBadge } from '@/components/dashboard/widgets/status-badge'
import { EmptyState } from '@/components/dashboard/widgets/empty-state'
import type { Case } from '@/lib/supabase/types'

function CaseCard({ c }: { c: Case }) {
  const attachments = (c.attachments ?? []) as unknown[]
  const accentColor = c.status === 'completed' ? '#22c55e'
    : c.status === 'in_progress' ? '#2563eb'
    : c.status === 'open' ? '#2dd4bf'
    : '#737373'

  return (
    <Link href={`/dashboard/case-management/${c.id}`} className="block group h-full">
      <div className="relative h-full p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(45,212,191,0.30)] hover:bg-[#161617]/80 transition-all cursor-pointer overflow-hidden">
        {/* Aksent ışıltı */}
        <div
          className="absolute -top-px left-0 right-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: `radial-gradient(60% 50% at 100% 0%, ${accentColor}10, transparent 70%)` }}
        />

        <div className="relative flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${accentColor}1f`, border: `1px solid ${accentColor}28` }}
            >
              <FileText className="w-4 h-4" style={{ color: accentColor }} strokeWidth={1.75} />
            </div>
            <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 min-w-0">
              {c.title}
            </h3>
          </div>
          <StatusBadge status={c.status} size="xs" showIcon={false} />
        </div>

        {c.description && (
          <p className="text-[#999999] text-xs line-clamp-2 mb-3 relative">{c.description}</p>
        )}

        {c.tags && c.tags.length > 0 && (
          <div className="relative flex flex-wrap gap-1 mb-3">
            {c.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#999999] border border-white/[0.05]">
                {tag}
              </span>
            ))}
            {c.tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-[#737373]">
                +{c.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="relative flex items-center justify-between text-[#737373] text-xs pt-3 border-t border-white/[0.04]">
          <span>{new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          {attachments.length > 0 && (
            <span className="flex items-center gap-1 text-[#999999]">
              <Paperclip className="w-3 h-3" />
              {attachments.length}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default async function CaseManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  const caseList = (cases ?? []) as Case[]

  const counts = {
    total: caseList.length,
    open: caseList.filter(c => c.status === 'open').length,
    in_progress: caseList.filter(c => c.status === 'in_progress').length,
    completed: caseList.filter(c => c.status === 'completed').length,
  }

  const stats = [
    { label: 'Toplam', value: counts.total, color: '#ffffff', bg: '#2dd4bf' },
    { label: 'Açık', value: counts.open, color: '#2dd4bf', bg: '#2dd4bf' },
    { label: 'Devam Ediyor', value: counts.in_progress, color: '#2563eb', bg: '#2563eb' },
    { label: 'Tamamlandı', value: counts.completed, color: '#22c55e', bg: '#22c55e' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-semibold text-white leading-tight flex items-center gap-2">
            Vaka Yönetimi
            <Sparkles className="w-4 h-4 text-[#2dd4bf]" />
          </h1>
          <p className="text-[#999999] text-sm mt-1">{counts.total} vaka</p>
        </div>
        <CaseForm mode="create" />
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="relative overflow-hidden p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.14)] transition-colors"
          >
            <div
              className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl pointer-events-none"
              style={{ background: `${stat.bg}14` }}
            />
            <p className="relative text-[#999999] text-xs mb-2 font-medium">{stat.label}</p>
            <p className="relative text-2xl font-semibold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
            <div className="relative mt-3 h-1 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: counts.total > 0 ? `${Math.min(100, (stat.value / counts.total) * 100)}%` : '0%', background: stat.bg }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Vaka listesi */}
      {caseList.length === 0 ? (
        <div className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl">
          <EmptyState
            icon={FolderOpen}
            title="Henüz vaka yok"
            subtitle="İlk vakanızı oluşturarak başlayın. STL, PDF ve görsel dosyalarınızı ekleyebilirsiniz."
            size="lg"
          />
          <div className="flex justify-center pb-10 -mt-3">
            <CaseForm mode="create" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {caseList.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}
