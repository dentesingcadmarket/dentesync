import Link from 'next/link'
import { ArrowUpRight, ChevronDown, FileText, MessageSquare, Layers, Search } from 'lucide-react'
import { DentalMotif, type DentalMotif as DentalMotifType } from './dental-icons'

/**
 * "Creativity accelerated / Across industries" muadili — Vaka Yönetimi UI mockup'ı.
 * Sol panel: Vakalar / Sohbetler / Dosyalar (Layers/Chats/Assets muadili).
 * Sağ ana alan: 6 sütun × 4 sıra dental icon grid'i (Morphic'in oyun asset'lerinin karşılığı).
 */

interface CaseLayer {
  name: string
  active?: boolean
  indent?: number
}

const CASE_LAYERS: CaseLayer[] = [
  { name: 'Zirkonyum köprü' },
  { name: 'Anterior kron' },
  { name: 'All-on-4 vaka', active: true },
  { name: 'Üst yapı', indent: 1 },
  { name: 'Abutmentler', indent: 1 },
  { name: 'PFM kor metal' },
  { name: 'Hibrid abutment' },
  { name: 'Kabuk veneer' },
  { name: 'Tam protez' },
  { name: 'Bölümsel protez' },
  { name: 'Inlay restorasyon' },
  { name: 'STL dosya analizi' },
  { name: 'Sinterleme prosedürü' },
  { name: 'Glazür uygulaması' },
  { name: 'Renk eşleştirme' },
]

const GRID_MOTIFS: DentalMotifType[] = [
  'tooth', 'crown', 'bridge', 'molar', 'implant', 'denture',
  'crown', 'tooth', 'implant', 'denture', 'bridge', 'molar',
  'bridge', 'implant', 'tooth', 'crown', 'molar', 'denture',
  'molar', 'denture', 'crown', 'bridge', 'tooth', 'implant',
]

export function CasesGridMockup() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-12 lg:items-end">
        <div className="lg:col-span-8">
          <h2 className="text-[36px] sm:text-[52px] lg:text-[64px] font-bold tracking-tight leading-[1.04] text-left">
            Hız her vakada
            <br />
            <span className="text-muted-silver">Her diş alanında</span>
          </h2>
        </div>
        <div className="lg:col-span-4 flex lg:justify-end lg:pb-3">
          <Link
            href="#use-cases"
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-pill bg-charcoal-surface/80 border border-outline-haze/[0.08] text-cloud-white text-body font-medium hover:bg-charcoal-surface transition-colors"
          >
            Tüm kullanımlar
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {/* Mockup — self-aura glow wrapper */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-x-8 -inset-y-12 -z-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(50% 60% at 30% 40%, rgba(37,99,235,0.22) 0%, transparent 65%),
              radial-gradient(60% 50% at 75% 60%, rgba(45,212,191,0.18) 0%, transparent 70%),
              radial-gradient(40% 40% at 50% 50%, rgba(20,184,166,0.10) 0%, transparent 70%)
            `,
            filter: 'blur(40px)',
          }}
        />
      <div className="relative rounded-[24px] overflow-hidden border border-outline-haze/[0.10] bg-nightfall-gray/80 backdrop-blur-xl shadow-[0_30px_120px_-20px_rgba(0,0,0,0.8),0_0_80px_-10px_rgba(45,212,191,0.18)]">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.06] bg-black/40">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <span className="text-muted-silver text-caption">Proje</span>
            <span className="text-muted-silver/60 text-caption">/</span>
            <span className="text-cloud-white text-caption">Vakalar</span>
            <ChevronDown className="w-3 h-3 text-muted-silver" strokeWidth={2} />
          </div>
          <div className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-morphic-blue text-cloud-white text-caption font-medium">
            Paylaş
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[440px]">
          {/* Sol panel */}
          <aside className="border-r border-white/[0.04] bg-black/20 p-3 hidden lg:block">
            <div className="flex items-center gap-2 mb-3 p-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
              {[
                { icon: FileText, label: 'Vakalar', active: true },
                { icon: MessageSquare, label: 'Sohbetler' },
                { icon: Layers, label: 'Dosyalar' },
              ].map(t => (
                <div
                  key={t.label}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded ${
                    t.active ? 'bg-morphic-blue/20 text-cloud-white' : 'text-muted-silver'
                  }`}
                >
                  <t.icon className="w-3 h-3" strokeWidth={1.8} />
                  <span className="text-[10px] font-medium">{t.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2 px-2">
              <Search className="w-3 h-3 text-muted-silver" strokeWidth={2} />
              <span className="text-muted-silver text-[10px]">Vaka ara…</span>
            </div>
            <div className="space-y-0.5">
              {CASE_LAYERS.map((l, i) => (
                <div
                  key={`${l.name}-${i}`}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-[10.5px] ${
                    l.active ? 'bg-morphic-blue/15 text-cloud-white' : 'text-cloud-white/70'
                  }`}
                  style={{ paddingLeft: `${8 + (l.indent ?? 0) * 12}px` }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: l.active ? '#2dd4bf' : 'rgba(255,255,255,0.25)' }}
                  />
                  <span className="truncate">{l.name}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Sağ: 6×4 dental icon grid */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
              {GRID_MOTIFS.map((m, i) => {
                const isHighlighted = i === 16 // ortada bir seçili tile
                return (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-xl bg-black/30 border ${
                      isHighlighted
                        ? 'border-morphic-blue/60 ring-1 ring-morphic-blue/30'
                        : 'border-white/[0.04]'
                    } flex items-center justify-center transition-colors hover:border-white/15`}
                  >
                    <DentalMotif
                      motif={m}
                      className="w-7 h-7 sm:w-8 sm:h-8 text-cloud-white/40"
                    />
                    {isHighlighted && (
                      <>
                        <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-morphic-blue border border-cloud-white" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-morphic-blue border border-cloud-white" />
                        <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-morphic-blue border border-cloud-white" />
                        <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-morphic-blue border border-cloud-white" />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
