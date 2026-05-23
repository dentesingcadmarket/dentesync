import { notFound } from 'next/navigation'
import { Calendar, Tag, FileText, AlertTriangle, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CaseForm } from '@/components/dashboard/case-form'
import { DeleteCaseButton } from '@/components/dashboard/delete-case-button'
import { FileUploader } from '@/components/dashboard/file-uploader'
import { ErrorAnalysisForm } from '@/components/dashboard/error-analysis-form'
import { BackButton } from '@/components/dashboard/back-button'
import { StatusBadge } from '@/components/dashboard/widgets/status-badge'
import type { Case, ErrorAnalysis } from '@/lib/supabase/types'
import type { CaseAttachment } from '@/app/actions/cases'

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Düşük', color: '#2dd4bf', bg: 'bg-[#2dd4bf]/15 text-[#2dd4bf]' },
  medium: { label: 'Orta', color: '#fbbf24', bg: 'bg-[#fbbf24]/15 text-[#fbbf24]' },
  high: { label: 'Yüksek', color: '#f97316', bg: 'bg-[#f97316]/15 text-[#f97316]' },
  critical: { label: 'Kritik', color: '#ef4444', bg: 'bg-[#ef4444]/15 text-[#ef4444]' },
}

export const dynamic = 'force-dynamic'

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [caseResult, analysesResult] = await Promise.all([
    supabase.from('cases').select('*').eq('id', params.id).eq('user_id', user!.id).maybeSingle(),
    supabase
      .from('error_analyses')
      .select('*')
      .eq('case_id', params.id)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  if (!caseResult.data) notFound()

  const c = caseResult.data as Case
  const analyses = (analysesResult.data ?? []) as ErrorAnalysis[]
  const attachments = (c.attachments ?? []) as CaseAttachment[]

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto space-y-6">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0f1716] via-[#161617] to-[#161617] p-5 lg:p-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#2dd4bf]/8 blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-4 flex-wrap">
          <BackButton href="/dashboard/case-management" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <h1 className="text-xl lg:text-2xl font-semibold text-white truncate flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2dd4bf] shrink-0" />
                {c.title}
              </h1>
              <StatusBadge status={c.status} size="sm" />
            </div>
            <p className="text-[#999999] text-sm">
              {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CaseForm mode="edit" existingCase={c} />
            <DeleteCaseButton caseId={c.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Sol */}
        <div className="lg:col-span-3 space-y-4">
          {c.description && (
            <div className="p-5 rounded-2xl bg-[#161617] border border-white/[0.06]">
              <h3 className="text-[10px] text-[#999999] uppercase tracking-wider mb-3 font-medium">Açıklama</h3>
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{c.description}</p>
            </div>
          )}

          {c.notes && (
            <div className="p-5 rounded-2xl bg-[#161617] border border-white/[0.06]">
              <h3 className="text-[10px] text-[#999999] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-[#2dd4bf]" /> Notlar
              </h3>
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{c.notes}</p>
            </div>
          )}

          {c.tags && c.tags.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#161617] border border-white/[0.06]">
              <h3 className="text-[10px] text-[#999999] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-[#2dd4bf]" /> Etiketler
              </h3>
              <div className="flex flex-wrap gap-2">
                {c.tags.map(tag => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-[#161617] border border-white/[0.06]">
            <h3 className="text-[10px] text-[#999999] uppercase tracking-wider mb-3 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#2dd4bf]" /> Tarihler
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#999999]">Oluşturuldu</span>
                <span className="text-white tabular-nums">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex justify-between items-center">
                <span className="text-[#999999]">Güncellendi</span>
                <span className="text-white tabular-nums">{new Date(c.updated_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#161617] border border-white/[0.06]">
            <h3 className="text-[10px] text-[#999999] uppercase tracking-wider mb-4 font-medium">
              Dosyalar ({attachments.length})
            </h3>
            <FileUploader caseId={c.id} attachments={attachments} />
          </div>

          <div className="p-5 rounded-2xl bg-[#161617] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] text-[#999999] uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24]" />
                Hata Analizleri ({analyses.length})
              </h3>
              <ErrorAnalysisForm
                initialCaseId={c.id}
                initialCaseTitle={c.title}
                trigger={
                  <span className="text-xs text-[#2dd4bf] hover:text-[#5eead4] px-2 py-1 rounded-lg hover:bg-[#2dd4bf]/8 transition-colors cursor-pointer font-medium">
                    + Ekle
                  </span>
                }
              />
            </div>

            {analyses.length === 0 ? (
              <p className="text-[#737373] text-xs text-center py-6">
                Bu vakaya henüz hata analizi eklenmedi.
              </p>
            ) : (
              <div className="space-y-2">
                {analyses.map(a => {
                  const cfg = SEVERITY_CONFIG[a.severity] ?? SEVERITY_CONFIG.low
                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#0a0a0a] border border-white/[0.05] hover:border-white/[0.10] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-white text-xs leading-snug line-clamp-2 flex-1">
                          {a.error_description}
                        </p>
                        <span className={`text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded-full ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {a.roadmap_impact && (
                        <p className="text-[#999999] text-[10px] italic mt-1">{a.roadmap_impact}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
