import Link from 'next/link'
import { Terminal, FolderOpen, AlertTriangle, ArrowRight, type LucideIcon } from 'lucide-react'
import { BackgroundVisual } from './background-visual'
import { ConsoleMockup, CasesMockup, ErrorsMockup } from './feature-mockups'

interface Feature {
  id: 'console' | 'cases' | 'errors'
  label: string
  icon: LucideIcon
  title: string
  description: string
  href: string
  linkLabel: string
  glow: string
  mesh: string
}

const FEATURES: Feature[] = [
  {
    id: 'console',
    label: 'D-Console',
    icon: Terminal,
    title: 'Sorular cevaba dönüşür',
    description:
      'Zirkonyum, implant ve protez sorularınıza saniyeler içinde uzman yanıt. Geçmiş sohbetler hatırlanır, streaming çıktı ile beklemeden okursunuz.',
    href: '/dashboard/search/console',
    linkLabel: "D-Console'u aç",
    glow: 'rgba(45,212,191,0.40)',
    mesh: 'radial-gradient(ellipse 60% 60% at 30% 45%, rgba(0,180,150,0.22) 0%, transparent 60%), radial-gradient(ellipse 55% 55% at 75% 78%, rgba(0,100,255,0.14) 0%, transparent 55%)',
  },
  {
    id: 'cases',
    label: 'Vaka Yönetimi',
    icon: FolderOpen,
    title: 'Her dosya tek yerde',
    description:
      'STL, OBJ, PDF ve görseller tek vaka altında toplanır. AI vakayı özetler, teslim tarihleri ve takip notları otomatik hatırlatılır.',
    href: '/dashboard/case-management',
    linkLabel: 'Vakaları aç',
    glow: 'rgba(37,99,235,0.38)',
    mesh: 'radial-gradient(ellipse 60% 60% at 70% 40%, rgba(37,99,235,0.20) 0%, transparent 60%), radial-gradient(ellipse 55% 55% at 25% 78%, rgba(45,212,191,0.14) 0%, transparent 55%)',
  },
  {
    id: 'errors',
    label: 'Hata Analizi',
    icon: AlertTriangle,
    title: 'Semptom değil, kök neden',
    description:
      'AI hatayı kök nedene bağlar, benzer geçmiş vakaları gösterir ve tekrar etmemesi için adım adım önleyici workflow önerir.',
    href: '/dashboard/case-management/error-analysis',
    linkLabel: 'Hata analizini aç',
    glow: 'rgba(245,158,11,0.34)',
    mesh: 'radial-gradient(ellipse 60% 60% at 35% 55%, rgba(245,158,11,0.20) 0%, transparent 60%), radial-gradient(ellipse 55% 55% at 75% 30%, rgba(220,38,38,0.14) 0%, transparent 55%)',
  },
]

function FeatureMock({ id }: { id: Feature['id'] }) {
  if (id === 'console') return <ConsoleMockup />
  if (id === 'cases') return <CasesMockup />
  return <ErrorsMockup />
}

/**
 * Morphic "Platform Features" eşdeğeri — 3'lü statik kart grid.
 * Eski FeatureTabs'in sekme yapısı kaldırıldı; her özellik kendi kartında.
 */
export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {FEATURES.map(f => {
        const Icon = f.icon
        return (
          <Link
            key={f.id}
            href={f.href}
            className="group relative flex flex-col rounded-hero overflow-hidden bg-nightfall-gray border border-outline-haze/[0.06] hover:border-white/15 transition-colors"
          >
            {/* Visual — gradient placeholder + CSS mockup (foto yok) */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <BackgroundVisual intensity="capability" glowColor={f.glow} />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none animate-mesh-drift"
                style={{ background: f.mesh }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]"
              />
              <div className="absolute inset-0 flex items-center justify-center p-5">
                <div className="w-full transition-transform duration-500 group-hover:-translate-y-1">
                  <FeatureMock id={f.id} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-pill bg-morphic-teal/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-morphic-teal" strokeWidth={1.8} />
                </div>
                <span className="text-cloud-white text-caption font-semibold tracking-widest uppercase">
                  {f.label}
                </span>
              </div>
              <h3 className="text-cloud-white text-subheading font-semibold tracking-tight mb-2">
                {f.title}
              </h3>
              <p className="text-muted-silver text-body leading-snug mb-4">{f.description}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-morphic-teal text-body font-medium">
                {f.linkLabel}
                <ArrowRight
                  className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
