import { Zap, FileText, Search, Sparkles, Map, Dumbbell, Eye, type LucideIcon } from 'lucide-react'
import { BackgroundVisual } from './background-visual'
import { SectionReveal } from './section-reveal'

interface Capability {
  id: string
  label: string
  icon: LucideIcon
  headline: string
  description: string
  /** Radial glow tint for the placeholder visual */
  glow: string
}

const CAPABILITIES: Capability[] = [
  {
    id: 'instant',
    label: 'Anlık AI Yanıt',
    icon: Zap,
    headline: 'Soru sor, saniyeler içinde uzman yanıt al',
    description:
      'Claude tabanlı asistan, zirkonyum kalınlığından implant açısına kadar her sorunuza diş teknolojisi bağlamında yanıt verir. Streaming çıktı sayesinde sonucu beklemeden okumaya başlarsınız.',
    glow: 'rgba(45, 212, 191, 0.34)',
  },
  {
    id: 'stl',
    label: 'STL Analiz',
    icon: FileText,
    headline: 'Dijital model dosyalarını otomatik analiz et',
    description:
      'STL ve OBJ dosyalarınızı yükleyin; duvar kalınlığı, alt kesim, marjinal kapanma gibi parametreleri AI otomatik raporlar. Manuel ölçüm dakikalardan saniyelere iner.',
    glow: 'rgba(59, 130, 246, 0.34)',
  },
  {
    id: 'errors',
    label: 'Hata Kök Neden',
    icon: Search,
    headline: 'Vaka hatalarını AI ile teşhis et',
    description:
      'Hatalı çıkan vakanın görselini ve notlarını yükleyin; AI semptomu kök nedene bağlar, benzer geçmiş vakaları gösterir ve önleyici workflow önerir.',
    glow: 'rgba(249, 115, 22, 0.32)',
  },
  {
    id: 'recommend',
    label: 'Vaka Önerisi',
    icon: Sparkles,
    headline: 'Benzer vakaları akıllı eşleştirme',
    description:
      'Üzerinde çalıştığınız vakanın özelliklerine göre veritabanından en benzer geçmiş vakalar önerilir. Hangi malzeme, hangi teknik işe yaramış görürsünüz.',
    glow: 'rgba(34, 197, 94, 0.32)',
  },
  {
    id: 'plan',
    label: 'Adım Adım Plan',
    icon: Map,
    headline: 'AI ile workflow planı oluştur',
    description:
      'Hedefinizi yazın — "anterior zirkonyum kron, kaninden kanine" — AI tüm aşamayı adım adım çıkartır. Her adımı tamamladıkça ilerleyin.',
    glow: 'rgba(139, 92, 246, 0.32)',
  },
  {
    id: 'practice',
    label: 'Pratik Senaryo',
    icon: Dumbbell,
    headline: 'AI üretimi pratik vakaları çöz',
    description:
      'Gerçek vakalardan üretilmiş senaryolarda hipotez kurun, tedavi planı önerin. AI puanlar, gelişim grafiğinizi tutar.',
    glow: 'rgba(236, 72, 153, 0.32)',
  },
  {
    id: 'visual',
    label: 'Görsel Eşleştirme',
    icon: Eye,
    headline: 'Renk, doku ve form karşılaştırma',
    description:
      'Hedef görselini ve mevcut çalışmanızı yan yana yükleyin; AI renk paletini, yüzey dokusunu ve form benzerliğini sayısal olarak karşılaştırır.',
    glow: 'rgba(14, 165, 233, 0.34)',
  },
]

/**
 * Morphic "Capabilities" eşdeğeri — 7 alternatifli metin/görsel blok.
 * Eski CapabilitiesTabs'in sekme yapısı kaldırıldı.
 */
export function CapabilitiesBlocks() {
  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {CAPABILITIES.map((cap, i) => {
        const reversed = i % 2 === 1
        const Icon = cap.icon
        return (
          <SectionReveal key={cap.id}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              {/* Text */}
              <div className={reversed ? 'lg:order-2' : ''}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-charcoal-surface/60 mb-5">
                  <Icon className="w-3.5 h-3.5 text-morphic-teal" strokeWidth={1.8} />
                  <span className="text-cloud-white text-caption font-medium tracking-widest uppercase">
                    {cap.label}
                  </span>
                </div>
                <h3 className="text-cloud-white text-[26px] sm:text-[34px] font-bold tracking-tight leading-[1.12] mb-4">
                  {cap.headline}
                </h3>
                <p className="text-muted-silver text-body-lg leading-relaxed max-w-xl">
                  {cap.description}
                </p>
              </div>

              {/* Visual — gradient placeholder (foto yok) */}
              <div className={reversed ? 'lg:order-1' : ''}>
                <div className="relative aspect-[16/11] rounded-hero overflow-hidden border border-outline-haze/[0.06]">
                  <BackgroundVisual intensity="capability" glowColor={cap.glow} />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none animate-mesh-drift"
                    style={{
                      background: `radial-gradient(ellipse 72% 72% at ${
                        reversed ? '68%' : '32%'
                      } 45%, ${cap.glow} 0%, transparent 66%)`,
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:38px_38px]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-super-large bg-ebony-canvas/70 backdrop-blur-md border border-outline-haze/[0.08] flex items-center justify-center">
                      <Icon className="w-9 h-9 text-morphic-teal" strokeWidth={1.4} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        )
      })}
    </div>
  )
}
