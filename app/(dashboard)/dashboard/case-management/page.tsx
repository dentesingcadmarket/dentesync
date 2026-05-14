import Link from 'next/link'
import { FolderOpen, Clock, CheckCircle, Archive, AlertCircle, Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CaseForm } from '@/components/dashboard/case-form'
import type { Case } from '@/lib/supabase/types'

const STATUS_CONFIG = {
  open: { label: 'Açık', color: 'bg-[#2563eb]/15 text-[#2563eb]', Icon: AlertCircle },
  in_progress: { label: 'Devam Ediyor', color: 'bg-[#f59e0b]/15 text-[#f59e0b]', Icon: Clock },
  completed: { label: 'Tamamlandı', color: 'bg-[#10b981]/15 text-[#10b981]', Icon: CheckCircle },
  archived: { label: 'Arşiv', color: 'bg-zinc-500/15 text-zinc-400', Icon: Archive },
}

function CaseCard({ c }: { c: Case }) {
  const cfg = STATUS_CONFIG[c.status]
  const attachments = (c.attachments ?? []) as unknown[]

  return (
    <Link href={`/dashboard/case-management/${c.id}`}>
      <div className="group p-5 rounded-2xl bg-[#111114] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] hover:bg-[#111114]/80 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-[#f4f4f5] font-medium text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {c.title}
          </h3>
          <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        {c.description && (
          <p className="text-[#71717a] text-xs line-clamp-2 mb-3">{c.description}</p>
        )}

        {c.tags && c.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {c.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1f] text-[#71717a] border border-[rgba(255,255,255,0.05)]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[#71717a] text-xs">
          <span>{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
          {attachments.length > 0 && (
            <span className="flex items-center gap-1">
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

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#f4f4f5]">Vaka Yönetimi</h1>
          <p className="text-[#71717a] text-sm mt-1">{counts.total} vaka</p>
        </div>
        <CaseForm mode="create" />
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Toplam', value: counts.total, color: 'text-[#f4f4f5]' },
          { label: 'Açık', value: counts.open, color: 'text-[#2563eb]' },
          { label: 'Devam Ediyor', value: counts.in_progress, color: 'text-[#f59e0b]' },
          { label: 'Tamamlandı', value: counts.completed, color: 'text-[#10b981]' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-2xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
            <p className="text-[#71717a] text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Vaka listesi */}
      {caseList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1f] flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-[#71717a]" />
          </div>
          <h3 className="text-[#f4f4f5] font-medium mb-2">Henüz vaka yok</h3>
          <p className="text-[#71717a] text-sm mb-6 max-w-xs">
            İlk vakanızı oluşturarak başlayın. STL, PDF ve görsel dosyalarınızı ekleyebilirsiniz.
          </p>
          <CaseForm mode="create" />
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
