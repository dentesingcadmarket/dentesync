import { notFound } from 'next/navigation'
import { Calendar, Tag, FileText, Clock, CheckCircle, Archive, AlertCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CaseForm } from '@/components/dashboard/case-form'
import { DeleteCaseButton } from '@/components/dashboard/delete-case-button'
import { FileUploader } from '@/components/dashboard/file-uploader'
import { ErrorAnalysisForm } from '@/components/dashboard/error-analysis-form'
import { BackButton } from '@/components/dashboard/back-button'
import type { Case, ErrorAnalysis } from '@/lib/supabase/types'
import type { CaseAttachment } from '@/app/actions/cases'

const STATUS_CONFIG = {
  open: { label: 'Açık', color: 'bg-[#2563eb]/15 text-[#2563eb]', Icon: AlertCircle },
  in_progress: { label: 'Devam Ediyor', color: 'bg-[#999999]/15 text-[#999999]', Icon: Clock },
  completed: { label: 'Tamamlandı', color: 'bg-[#2563eb]/15 text-[#2563eb]', Icon: CheckCircle },
  archived: { label: 'Arşiv', color: 'bg-[#737373]/15 text-[#999999]', Icon: Archive },
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
  const cfg = STATUS_CONFIG[c.status]
  const StatusIcon = cfg.Icon
  const attachments = (c.attachments ?? []) as CaseAttachment[]

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Geri + başlık */}
      <div className="flex items-start gap-4 mb-8">
        <BackButton href="/dashboard/case-management" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-[#ffffff] truncate">{c.title}</h1>
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
              <StatusIcon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>
          <p className="text-[#999999] text-sm mt-1">
            {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CaseForm mode="edit" existingCase={c} />
          <DeleteCaseButton caseId={c.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sol: Vaka bilgileri */}
        <div className="lg:col-span-3 space-y-5">
          {c.description && (
            <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
              <h3 className="text-xs text-[#999999] uppercase tracking-wider mb-3">Açıklama</h3>
              <p className="text-[#ffffff] text-sm leading-relaxed whitespace-pre-wrap">{c.description}</p>
            </div>
          )}

          {c.notes && (
            <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
              <h3 className="text-xs text-[#999999] uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Notlar
              </h3>
              <p className="text-[#ffffff] text-sm leading-relaxed whitespace-pre-wrap">{c.notes}</p>
            </div>
          )}

          {c.tags && c.tags.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
              <h3 className="text-xs text-[#999999] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" /> Etiketler
              </h3>
              <div className="flex flex-wrap gap-2">
                {c.tags.map(tag => (
                  <span key={tag} className="text-sm px-3 py-1 rounded-full bg-[#1f1f20] text-[#999999] border border-[rgba(229,231,235,0.08)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
            <h3 className="text-xs text-[#999999] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Tarihler
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#999999]">Oluşturuldu</span>
                <span className="text-[#ffffff]">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999999]">Güncellendi</span>
                <span className="text-[#ffffff]">{new Date(c.updated_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Dosyalar + Hata Analizleri */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
            <h3 className="text-xs text-[#999999] uppercase tracking-wider mb-4">Dosyalar ({attachments.length})</h3>
            <FileUploader caseId={c.id} attachments={attachments} />
          </div>

          {/* Hata Analizleri */}
          <div className="p-5 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-[#999999] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#999999]" />
                Hata Analizleri ({analyses.length})
              </h3>
              <ErrorAnalysisForm
                initialCaseId={c.id}
                initialCaseTitle={c.title}
                trigger={
                  <span className="text-xs text-[#999999] hover:text-[#ffffff] px-2 py-1 rounded-lg hover:bg-[#1f1f20] transition-colors cursor-pointer">
                    + Ekle
                  </span>
                }
              />
            </div>

            {analyses.length === 0 ? (
              <p className="text-[#999999] text-xs text-center py-4">
                Bu vakaya henüz hata analizi eklenmedi.
              </p>
            ) : (
              <div className="space-y-2">
                {analyses.map(a => {
                  const severityColors: Record<string, string> = {
                    low: 'text-[#2563eb]',
                    medium: 'text-[#999999]',
                    high: 'text-anchor-graphite',
                    critical: 'text-anchor-graphite',
                  }
                  const severityLabels: Record<string, string> = {
                    low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik',
                  }
                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#000000] border border-[rgba(229,231,235,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[#ffffff] text-xs leading-snug line-clamp-2 flex-1">
                          {a.error_description}
                        </p>
                        <span className={`text-[10px] font-medium shrink-0 ${severityColors[a.severity]}`}>
                          {severityLabels[a.severity]}
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
