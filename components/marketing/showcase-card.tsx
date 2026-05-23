import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BackgroundVisual } from './background-visual'
import { DentalMotif, type DentalMotif as DentalMotifType } from './dental-icons'
import { cn } from '@/lib/utils'

export interface ShowcaseItem {
  slug: string
  title: string
  subtitle: string
  description?: string
  /** Optional video — sonradan eklenebilir */
  videoSrc?: string
  posterSrc?: string
  /** Dental illustration shown when no photo asset is provided */
  motif?: DentalMotifType
  href: string
}

interface ShowcaseCardProps {
  item: ShowcaseItem
  className?: string
}

export function ShowcaseCard({ item, className }: ShowcaseCardProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        'group relative aspect-[4/5] overflow-hidden rounded-cards block transition-all duration-300 hover:border-white/15 border border-outline-haze/[0.06] cursor-pointer',
        className,
      )}
    >
      <BackgroundVisual
        intensity="tile"
        posterSrc={item.posterSrc}
        videoSrc={item.videoSrc}
        glowColor="rgba(45, 212, 191, 0.08)"
      />

      {/* Dental motif placeholder — shown when no photo/video asset */}
      {!item.posterSrc && !item.videoSrc ? (
        <div className="absolute inset-0 flex items-center justify-center text-cloud-white/25 group-hover:text-cloud-white/45 transition-colors pointer-events-none">
          <DentalMotif
            motif={item.motif ?? 'tooth'}
            className="w-24 h-24 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          />
        </div>
      ) : null}

      {/* Bottom gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent pointer-events-none" />

      {/* Title + description */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-10 flex items-end justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-muted-silver text-caption tracking-widest uppercase mb-1 group-hover:text-morphic-teal transition-colors">
            {item.subtitle}
          </p>
          <h3 className="text-cloud-white text-subheading font-semibold tracking-tight leading-snug">
            {item.title}
          </h3>
          {item.description ? (
            <p className="text-muted-silver text-caption mt-2 leading-snug line-clamp-2 max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-2 transition-all duration-300">
              {item.description}
            </p>
          ) : null}
        </div>
        <div className="w-8 h-8 rounded-pill bg-white/[0.08] backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/[0.14] transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-cloud-white" strokeWidth={1.6} />
        </div>
      </div>
    </Link>
  )
}
