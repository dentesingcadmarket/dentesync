'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { WorkflowCard, type WorkflowItem } from './workflow-card'

interface WorkflowScrollerProps {
  items: WorkflowItem[]
  /** "Hepsini gör" hedefi */
  seeMoreHref?: string
}

/**
 * Morphic-style horizontal workflow scroller.
 * - 2-col header: solda başlık + muted subtitle, sağda nav (< > + Hepsini gör pill)
 * - Tek satır yatay scroll, snap-x, kart başına sabit yükseklik
 * - "< >" butonları scroll container'ı 80% width kaydırır
 */
export function WorkflowScroller({ items, seeMoreHref = '/dashboard/how-to-use' }: WorkflowScrollerProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const delta = el.clientWidth * 0.8 * (direction === 'left' ? -1 : 1)
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      {/* Header — sol: heading, sağ: nav */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 max-w-7xl mx-auto px-6">
        <div>
          <h2 className="text-cloud-white text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05]">
            {"Workflow'lar"}
          </h2>
          <h2 className="text-muted-silver text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05]">
            Hız için tasarlandı
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollBy('left')}
            aria-label="Önceki"
            className="inline-flex items-center justify-center w-10 h-10 rounded-pill bg-charcoal-surface/80 border border-outline-haze/[0.08] text-cloud-white hover:bg-charcoal-surface transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy('right')}
            aria-label="Sonraki"
            className="inline-flex items-center justify-center w-10 h-10 rounded-pill bg-charcoal-surface/80 border border-outline-haze/[0.08] text-cloud-white hover:bg-charcoal-surface transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.6} />
          </button>
          <Link
            href={seeMoreHref}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-pill bg-charcoal-surface/80 border border-outline-haze/[0.08] text-cloud-white text-body font-medium hover:bg-charcoal-surface transition-colors"
          >
            Hepsini gör
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {/* Yatay scroll satırı — full-bleed (sayfa kenarına kadar uzanır), padding ile içeriyi 7xl konteyner hizasına sok */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map(w => (
          <WorkflowCard
            key={w.slug}
            item={w}
            className="aspect-square h-[260px] sm:h-[280px] w-auto shrink-0 snap-start"
          />
        ))}
      </div>
    </div>
  )
}
