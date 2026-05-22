'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanFeature {
  label: string
  tag?: 'api' | 'uptime'
}

interface Plan {
  name: string
  label: string
  priceMonthly: string
  priceYearly: string
  description: string
  features: PlanFeature[]
  cta: string
  highlight: boolean
  enterprise?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'M1',
    label: 'Başlangıç',
    priceMonthly: '$9',
    priceYearly: '$7.2',
    description: 'Serbest teknisyenler için hızlı başlangıç paketi',
    features: [
      { label: 'D-Console (temel)' },
      { label: 'Vaka Yönetimi (sınırsız)' },
      { label: 'Hata Analizi' },
      { label: 'Topluluk (okuma)' },
      { label: 'Haberler & Mağaza' },
    ],
    cta: 'Başlayın',
    highlight: false,
  },
  {
    name: 'M2',
    label: 'Profesyonel',
    priceMonthly: '$17',
    priceYearly: '$13.6',
    description: 'Verimliliğini maksimuma çıkarmak isteyen teknisyenler için',
    features: [
      { label: "M1'deki her şey" },
      { label: 'Vaka Pratiği (AI)' },
      { label: 'Topluluk (yazma & yorum)' },
      { label: 'Gelişmiş D-Console' },
      { label: 'Planım (tam erişim)' },
    ],
    cta: 'Profesyonel Başlayın',
    highlight: true,
  },
  {
    name: 'M3',
    label: 'B2B',
    priceMonthly: '$45',
    priceYearly: '$36',
    description: 'Klinikler, laboratuvarlar ve ekipler için kurumsal çözüm',
    features: [
      { label: "M2'deki her şey" },
      { label: 'Çok kullanıcı yönetimi' },
      { label: 'Öncelikli destek' },
      { label: 'Özel entegrasyonlar', tag: 'api' },
      { label: 'SLA garantisi', tag: 'uptime' },
    ],
    cta: 'Ekibinizi Büyütün',
    highlight: false,
    enterprise: true,
  },
]

const STATS = [
  { value: '1.200+', label: 'aktif teknisyen' },
  { value: '%99.9', label: 'uptime garantisi' },
  { value: '14 gün', label: 'ücretsiz deneme' },
]

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="relative max-w-5xl mx-auto px-6 py-24">
      {/* Social proof — 3 stat pills above heading */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {STATS.map(s => (
          <div
            key={s.label}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/[0.04] border border-outline-haze/[0.06] text-caption"
          >
            <span className="text-cloud-white font-semibold tracking-tight">{s.value}</span>
            <span className="text-muted-silver">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-ebony-canvas text-muted-silver text-caption mb-5">
          FİYATLANDIRMA
        </div>
        <h2 className="text-[32px] sm:text-heading-lg font-bold tracking-tight mb-3">
          Şeffaf fiyatlandırma
        </h2>
        <p className="text-muted-silver text-body-lg">
          Büyüdükçe planınızı yükseltin. Yıllık ödemede %20 tasarruf edin. İstediğiniz zaman iptal edin.
        </p>
      </div>

      {/* Monthly / Yearly toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 p-1 rounded-pill bg-charcoal-surface/80 border border-outline-haze/[0.08]">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={cn(
              'px-4 py-1.5 rounded-pill text-body font-medium transition-colors cursor-pointer',
              billing === 'monthly'
                ? 'bg-white/[0.10] text-cloud-white'
                : 'text-muted-silver hover:text-cloud-white',
            )}
            aria-pressed={billing === 'monthly'}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-pill text-body font-medium transition-colors cursor-pointer',
              billing === 'yearly'
                ? 'bg-white/[0.10] text-cloud-white'
                : 'text-muted-silver hover:text-cloud-white',
            )}
            aria-pressed={billing === 'yearly'}
          >
            Yıllık
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-morphic-teal/20 text-morphic-teal">
              -%20
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map(plan => {
          const price = billing === 'monthly' ? plan.priceMonthly : plan.priceYearly
          return (
            <div
              key={plan.name}
              className={cn(
                'group/plan relative p-6 rounded-large flex flex-col overflow-hidden transition-colors duration-300',
                plan.highlight
                  ? 'bg-[linear-gradient(135deg,#1a2a2a_0%,#0d1f1f_100%)] border border-morphic-teal/30 ring-1 ring-morphic-teal/15'
                  : 'bg-nightfall-gray border border-outline-haze/[0.06] hover:border-white/15',
              )}
            >
              {plan.highlight ? (
                <>
                  <div className="absolute -top-2.5 left-6 inline-block px-2.5 py-0.5 rounded-pill text-ebony-canvas text-caption font-semibold shimmer-badge">
                    Popüler
                  </div>
                  {/* dekoratif ince dikey çizgi (sağ taraf) */}
                  <div
                    aria-hidden="true"
                    className="absolute top-6 bottom-6 right-3 w-px bg-gradient-to-b from-transparent via-morphic-teal/30 to-transparent"
                  />
                </>
              ) : null}

              {plan.enterprise ? (
                <Building2
                  aria-hidden="true"
                  className="absolute bottom-3 right-3 w-10 h-10 text-morphic-aqua opacity-0 group-hover/plan:opacity-25 transition-opacity duration-300"
                  strokeWidth={1.4}
                />
              ) : null}

              <div className="mb-1">
                <span className="text-muted-silver text-caption font-medium uppercase tracking-widest">{plan.name}</span>
                <p className="text-cloud-white text-subheading font-semibold mt-0.5 tracking-tight">{plan.label}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-1 mt-3">
                <span
                  className="text-[40px] font-bold tracking-tight text-cloud-white leading-none transition-all duration-200"
                  key={billing}
                >
                  {price}
                </span>
                <span className="text-muted-silver text-body">/ay</span>
              </div>
              <p className="text-muted-silver text-body mb-2">{plan.description}</p>

              {plan.highlight ? (
                <p className="text-morphic-teal/80 text-caption mb-4 leading-snug">
                  En popüler seçim — teknisyenlerin %68&apos;i bu planı tercih ediyor
                </p>
              ) : (
                <div className="mb-4" />
              )}

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f.label} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-morphic-teal shrink-0" strokeWidth={1.8} />
                    <span className="text-light-mist text-body flex-1">{f.label}</span>
                    {f.tag === 'api' ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-morphic-aqua/15 text-morphic-aqua text-[10px] font-mono font-semibold">
                        API
                      </span>
                    ) : f.tag === 'uptime' ? (
                      <span className="text-morphic-teal text-caption font-semibold">99.9%</span>
                    ) : null}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-body font-medium transition-colors cursor-pointer',
                  plan.highlight
                    ? 'rounded-buttons bg-morphic-blue text-cloud-white hover:bg-morphic-blue-hover'
                    : 'rounded-pill bg-white/[0.06] text-cloud-white hover:bg-white/[0.10]',
                )}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-muted-silver text-caption text-center mt-2">
                Kredi kartı gerekmez · 14 gün ücretsiz
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
