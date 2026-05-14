import Link from 'next/link'
import { AlertTriangle, ArrowRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getApiKey } from '@/app/actions/api-key'
import { getCasesForSelect } from '@/app/actions/error-analysis'
import { ErrorAnalysisForm } from '@/components/dashboard/error-analysis-form'
import type { ErrorAnalysis } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const SEVERITY_CONFIG = {
  low: { label: 'Düşük', color: 'bg-[#10b981]/15 text-[#10b981]' },
  medium: { label: 'Orta', color: 'bg-[#f59e0b]/15 text-[#f59e0b]' },
  high: { label: 'Yüksek', color: 'bg-orange-500/15 text-orange-400' },
  critical: { label: 'Kritik', color: 'bg-red-500/15 text-red-400' },
}

export default async function ErrorAnalysisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [analysesRaw, apiKey, cases] = await Promise.all([
    supabase
      .from('error_analyses')
      .select('*, cases(title)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    getApiKey(),
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
          <div className="flex items-center gap-3 mb-1.5">
            <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
            <h1 className="text-2xl font-semibold text-[#f4f4f5]">Hata Analizleri</h1>
          </div>
          <p className="text-[#71717a] text-sm">
            AI destekli kök neden analizi ve çözüm önerileri
          </p>
        </div>
        <ErrorAnalysisForm
          apiKey={apiKey}
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
              <div key={s} className="p-4 rounded-2xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
                <p className="text-2xl font-semibold text-[#f4f4f5] mb-1">{count}</p>
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
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-[#71717a]" />
          </div>
          <h3 className="text-[#f4f4f5] font-medium mb-2">Henüz analiz yok</h3>
          <p className="text-[#71717a] text-sm max-w-xs mb-6">
            Karşılaştığın hatayı açıkla, AI kök neden analizi ve çözüm önerileri sunsun.
          </p>
          <ErrorAnalysisForm apiKey={apiKey} cases={cases} />
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
    <div className="p-5 rounded-2xl bg-[#111114] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          {a.cases?.title && (
            <p className="text-[#71717a] text-xs mb-1 truncate">{a.cases.title}</p>
          )}
          <p className="text-[#f4f4f5] text-sm font-medium leading-snug line-clamp-2">
            {a.error_description}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
          {a.case_id && (
            <ArrowRight className="w-4 h-4 text-[#71717a] group-hover:text-[#f4f4f5] transition-colors" />
          )}
        </div>
      </div>
      {a.roadmap_impact && (
        <p className="text-[#71717a] text-xs mt-2 italic line-clamp-1">{a.roadmap_impact}</p>
      )}
      {a.ai_analysis && (
        <p className="text-[#71717a] text-xs mt-1.5 line-clamp-2">{a.ai_analysis}</p>
      )}
      <p className="text-[#71717a] text-[10px] mt-3">
        {new Date(a.created_at).toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })}
      </p>
    </div>
  )
}
