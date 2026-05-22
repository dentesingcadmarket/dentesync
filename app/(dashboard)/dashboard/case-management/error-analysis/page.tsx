import Link from 'next/link'
import { AlertTriangle, ArrowRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCasesForSelect } from '@/app/actions/error-analysis'
import { ErrorAnalysisForm } from '@/components/dashboard/error-analysis-form'
import { BackButton } from '@/components/dashboard/back-button'
import type { ErrorAnalysis } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const SEVERITY_CONFIG = {
  low: { label: 'Düşük', color: 'bg-[#2563eb]/15 text-[#2563eb]' },
  medium: { label: 'Orta', color: 'bg-[#999999]/15 text-[#999999]' },
  high: { label: 'Yüksek', color: 'bg-anchor-graphite0/15 text-anchor-graphite' },
  critical: { label: 'Kritik', color: 'bg-anchor-graphite0/15 text-anchor-graphite' },
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
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BackButton href="/dashboard/case-management" />
            <AlertTriangle className="w-6 h-6 text-[#999999]" />
            <h1 className="text-2xl font-semibold text-[#ffffff]">Hata Analizleri</h1>
          </div>
          <p className="text-[#999999] text-sm">
            AI destekli kök neden analizi ve çözüm önerileri
          </p>
        </div>
        <ErrorAnalysisForm
          cases={cases}
          trigger={
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
              Yeni Analiz
            </span>
          }
        />
      </div>

      {/* Stats */}
      {list.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(['low', 'medium', 'high', 'critical'] as const).map(s => {
            const cfg = SEVERITY_CONFIG[s]
            const count = totalBySeverity[s] ?? 0
            return (
              <div key={s} className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
                <p className="text-2xl font-semibold text-[#ffffff] mb-1">{count}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-[#999999]" />
          </div>
          <h3 className="text-[#ffffff] font-medium mb-2">Henüz analiz yok</h3>
          <p className="text-[#999999] text-sm max-w-xs mb-6">
            Karşılaştığın hatayı açıkla, AI kök neden analizi ve çözüm önerileri sunsun.
          </p>
          <ErrorAnalysisForm cases={cases} />
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(a => {
            const cfg = SEVERITY_CONFIG[a.severity]
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
  cfg: { label: string; color: string }
}) {
  return (
    <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          {a.cases?.title && (
            <p className="text-[#999999] text-xs mb-1 truncate">{a.cases.title}</p>
          )}
          <p className="text-[#ffffff] text-sm font-medium leading-snug line-clamp-2">
            {a.error_description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
          {a.case_id && (
            <ArrowRight className="w-4 h-4 text-[#999999] group-hover:text-[#ffffff] transition-colors" />
          )}
        </div>
      </div>
      {a.roadmap_impact && (
        <p className="text-[#999999] text-xs mt-2 italic line-clamp-1">{a.roadmap_impact}</p>
      )}
      {a.ai_analysis && (
        <p className="text-[#999999] text-xs mt-1.5 line-clamp-2">{a.ai_analysis}</p>
      )}
      <p className="text-[#999999] text-[10px] mt-3">
        {new Date(a.created_at).toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })}
      </p>
    </div>
  )
}
