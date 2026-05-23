import Link from 'next/link'
import { AlertTriangle, ArrowRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCasesForSelect } from '@/app/actions/error-analysis'
import { ErrorAnalysisForm } from '@/components/dashboard/error-analysis-form'
import { BackButton } from '@/components/dashboard/back-button'
import { EmptyState } from '@/components/dashboard/widgets/empty-state'
import type { ErrorAnalysis } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; ring: string; bar: string }> = {
  low: { label: 'Düşük', bg: 'bg-[#2dd4bf]/15 text-[#2dd4bf]', ring: 'ring-[#2dd4bf]/25', bar: '#2dd4bf' },
  medium: { label: 'Orta', bg: 'bg-[#fbbf24]/15 text-[#fbbf24]', ring: 'ring-[#fbbf24]/25', bar: '#fbbf24' },
  high: { label: 'Yüksek', bg: 'bg-[#f97316]/15 text-[#f97316]', ring: 'ring-[#f97316]/25', bar: '#f97316' },
  critical: { label: 'Kritik', bg: 'bg-[#ef4444]/15 text-[#ef4444]', ring: 'ring-[#ef4444]/25', bar: '#ef4444' },
}

export default async function ErrorAnalysisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [analysesRaw, cases] = await Promise.all([
    supabase
      .from('error_analyses')
      .select('*, cases(title)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    getCasesForSelect(),
  ])

  const list = (analysesRaw.data ?? []) as (ErrorAnalysis & { cases: { title: string } | null })[]

  const totalBySeverity = list.reduce(
    (acc, a) => { acc[a.severity] = (acc[a.severity] ?? 0) + 1; return acc },
    {} as Record<string, number>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#1b140f] via-[#161617] to-[#161617] p-5 lg:p-6">
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#fbbf24]/8 blur-3xl pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <BackButton href="/dashboard/case-management" />
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                Hata Analizleri
              </h1>
              <p className="text-[#999999] text-sm mt-1">
                AI destekli kök neden analizi ve çözüm önerileri
              </p>
            </div>
          </div>
          <ErrorAnalysisForm
            cases={cases}
            trigger={
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-sm font-semibold hover:bg-[#5eead4] transition-colors cursor-pointer shadow-[0_0_24px_rgba(45,212,191,0.18)]">
                <Plus className="w-4 h-4" />
                Yeni Analiz
              </span>
            }
          />
        </div>
      </div>

      {/* Stats */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['low', 'medium', 'high', 'critical'] as const).map(s => {
            const cfg = SEVERITY_CONFIG[s]
            const count = totalBySeverity[s] ?? 0
            const max = Math.max(...Object.values(totalBySeverity), 1)
            return (
              <div key={s} className="relative overflow-hidden p-4 rounded-2xl bg-[#161617] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl pointer-events-none" style={{ background: `${cfg.bar}15` }} />
                <p className="relative text-2xl font-semibold text-white mb-2 tabular-nums">{count}</p>
                <span className={`relative text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg}`}>
                  {cfg.label}
                </span>
                <div className="relative mt-3 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(count / max) * 100}%`, background: cfg.bar }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {list.length === 0 ? (
        <div className="bg-[#161617] border border-white/[0.06] rounded-2xl">
          <EmptyState
            icon={AlertTriangle}
            title="Henüz analiz yok"
            subtitle="Karşılaştığın hatayı açıkla, AI kök neden analizi ve çözüm önerileri sunsun."
            size="lg"
          />
          <div className="flex justify-center pb-10 -mt-3">
            <ErrorAnalysisForm cases={cases} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(a => {
            const cfg = SEVERITY_CONFIG[a.severity] ?? SEVERITY_CONFIG.low
            return (
              <div key={a.id} className="group">
                {a.case_id ? (
                  <Link href={`/dashboard/case-management/${a.case_id}`}>
                    <AnalysisCard a={a} cfg={cfg} />
                  </Link>
                ) : (
                  <AnalysisCard a={a} cfg={cfg} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AnalysisCard({
  a,
  cfg,
}: {
  a: ErrorAnalysis & { cases: { title: string } | null }
  cfg: { label: string; bg: string; bar: string }
}) {
  return (
    <div className="relative overflow-hidden p-5 rounded-2xl bg-[#161617] border border-white/[0.06] hover:border-white/[0.14] transition-all cursor-pointer group">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cfg.bar, opacity: 0.7 }} />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 pl-1">
          {a.cases?.title && (
            <p className="text-[#737373] text-[11px] mb-1 truncate">{a.cases.title}</p>
          )}
          <p className="text-white text-sm font-medium leading-snug line-clamp-2">
            {a.error_description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${cfg.bg}`}>
            {cfg.label}
          </span>
          {a.case_id && (
            <ArrowRight className="w-4 h-4 text-[#737373] group-hover:text-[#2dd4bf] group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
      {a.roadmap_impact && (
        <p className="text-[#999999] text-xs mt-2 italic line-clamp-1 pl-1">{a.roadmap_impact}</p>
      )}
      {a.ai_analysis && (
        <p className="text-[#999999] text-xs mt-1.5 line-clamp-2 pl-1">{a.ai_analysis}</p>
      )}
      <p className="text-[#737373] text-[10px] mt-3 pl-1">
        {new Date(a.created_at).toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })}
      </p>
    </div>
  )
}
