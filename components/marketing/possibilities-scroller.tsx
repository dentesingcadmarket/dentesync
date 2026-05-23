'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DentalMotif, type DentalMotif as DentalMotifType } from './dental-icons'

interface PossibilityItem {
  slug: string
  title: string
  description: string
  motif: DentalMotifType
}

const ITEMS: PossibilityItem[] = [
  {
    slug: 'zirkonyum',
    title: 'Zirkonyum analizi.',
    description: 'STL dosyalarını yükleyip otomatik mesh kontrolü, kalınlık ve marjinal uyum raporu al.',
    motif: 'crown',
  },
  {
    slug: 'kok-neden',
    title: 'Hata kök neden.',
    description: 'Geri dönen vakaları analiz et, kalıcı çözüm önerisini D-Console’dan dinle.',
    motif: 'tooth',
  },
  {
    slug: 'adim-planlama',
    title: 'Adım planlama.',
    description: 'Karmaşık vakaları gün-gün iş planına böl, ekibinle paylaş, takip et.',
    motif: 'bridge',
  },
  {
    slug: 'renk-esleme',
    title: 'Renk eşleştirme.',
    description: 'Vita skalası karşılaştırması, fotoğraf analizi ve hekim onayı tek akışta.',
    motif: 'molar',
  },
  {
    slug: 'implant-rehberi',
    title: 'İmplant rehberi.',
    description: 'Açı, abutment seçimi ve protez planlama desteğini vaka bağlamında al.',
    motif: 'implant',
  },
]

/**
 * "Endless possibilities / Seamless workflows" muadili — büyük horizontal scroll kartlar.
 */
export function PossibilitiesScroller() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateButtons = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    updateButtons()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateButtons, { passive: true })
    window.addEventListener('resize', updateButtons)
    return () => {
      el.removeEventListener('scroll', updateButtons)
      window.removeEventListener('resize', updateButtons)
    }
  }, [])

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section className="relative py-24">
      <div className="max-w-7xl mx-auto px-6 mb-10 flex items-end justify-between gap-6">
        <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05]">
          Sınırsız olanaklar
          <br />
          <span className="text-muted-silver">Kesintisiz çözümler</span>
        </h2>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Sola kaydır"
            onClick={() => scrollByAmount(-1)}
            disabled={!canPrev}
            className={cn(
              'inline-flex items-center justify-center w-10 h-10 rounded-pill bg-charcoal-surface/80 border border-white/[0.08] text-cloud-white transition-colors',
              canPrev ? 'hover:bg-charcoal-surface cursor-pointer' : 'opacity-40 cursor-not-allowed',
            )}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Sağa kaydır"
            onClick={() => scrollByAmount(1)}
            disabled={!canNext}
            className={cn(
              'inline-flex items-center justify-center w-10 h-10 rounded-pill bg-charcoal-surface/80 border border-white/[0.08] text-cloud-white transition-colors',
              canNext ? 'hover:bg-charcoal-surface cursor-pointer' : 'opacity-40 cursor-not-allowed',
            )}
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ebony-canvas to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ebony-canvas to-transparent z-20" />
        <div
          ref={scrollerRef}
          className="overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex gap-4 px-6 min-w-max">
            {ITEMS.map(item => (
              <PossibilityCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PossibilityCard({ item }: { item: PossibilityItem }) {
  return (
    <div className="group shrink-0 w-[300px] sm:w-[340px] h-[440px] rounded-[24px] overflow-hidden bg-nightfall-gray border border-outline-haze/[0.08] hover:border-white/15 transition-colors flex flex-col">
      {/* Görsel alan — koyu zemin + ortada büyük dental motif */}
      <div className="relative flex-1 overflow-hidden bg-black/40">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 60% at 50% 40%, rgba(45,212,191,0.08) 0%, transparent 65%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-cloud-white/30 group-hover:text-cloud-white/45 transition-colors">
          <DentalMotif motif={item.motif} className="w-28 h-28 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]" />
        </div>
      </div>

      {/* Alt: başlık + açıklama + plus icon */}
      <div className="p-5 flex items-start justify-between gap-3 border-t border-white/[0.04]">
        <div className="flex-1 min-w-0">
          <p className="text-cloud-white text-body-lg leading-snug">
            <span className="font-semibold">{item.title}</span>{' '}
            <span className="text-muted-silver">{item.description}</span>
          </p>
        </div>
        <button
          type="button"
          aria-label="Daha fazla"
          className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0 text-cloud-white hover:bg-white/[0.12] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
