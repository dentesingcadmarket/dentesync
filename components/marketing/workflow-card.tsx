'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { BackgroundVisual } from './background-visual'
import { DentalMotif, type DentalMotif as DentalMotifType } from './dental-icons'
import { cn } from '@/lib/utils'

export interface WorkflowItem {
  slug: string
  title: string
  /** Kısa açıklama — başlığın altında 1 satır, muted */
  description?: string
  /** Manuel kart tinti (HSL hue). Verilmezse slug hash'inden türetilir */
  hue?: number
  /** Kart merkezinde gösterilecek dental SVG illustration */
  motif?: DentalMotifType
  /** Optional video URL — sonradan eklenecek; null/undefined ise sadece blurred placeholder oynatılır */
  videoSrc?: string | null
  /** Optional static poster shown before/instead of video */
  posterSrc?: string | null
  href: string
}

interface WorkflowCardProps {
  item: WorkflowItem
  className?: string
}

/**
 * Morphic-style workflow card.
 * - Idle: blurred placeholder visual + title overlay.
 * - Hover: title brightens, "Workflow'u aç" pill scales in, video (if present) plays.
 * - Click: navigates to {item.href}.
 */
export function WorkflowCard({ item, className }: WorkflowCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hovered, setHovered] = useState(false)

  const handleEnter = () => {
    setHovered(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => undefined)
    }
  }
  const handleLeave = () => {
    setHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const glow = 'rgba(45, 212, 191, 0.08)'

  return (
    <Link
      href={item.href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-[20px] bg-nightfall-gray border border-outline-haze/[0.06] block transition-all duration-300 hover:border-white/15 cursor-pointer',
        className,
      )}
    >
      {/* Backdrop layer */}
      <BackgroundVisual intensity="tile" posterSrc={item.posterSrc ?? undefined} glowColor={glow} />

      {/* Centered dental motif — fills the "empty" feel until real assets land */}
      {!item.videoSrc && !item.posterSrc ? (
        <div className="absolute inset-0 flex items-center justify-center text-cloud-white/30 group-hover:text-cloud-white/50 transition-colors pointer-events-none">
          <DentalMotif
            motif={item.motif ?? 'tooth'}
            className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          />
        </div>
      ) : null}

      {/* Optional inline video (independent of BackgroundVisual to control play/pause via ref) */}
      {item.videoSrc ? (
        <video
          ref={videoRef}
          src={item.videoSrc}
          muted
          loop
          playsInline
          preload="none"
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        />
      ) : null}

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent pointer-events-none" />

      {/* Play indicator (top-right) — appears only when video exists */}
      {item.videoSrc ? (
        <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-pill bg-white/[0.08] backdrop-blur-md border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-3 h-3 text-cloud-white fill-current" strokeWidth={1.5} />
        </div>
      ) : null}

      {/* Title + description (morphic pattern — no CTA pill) */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
        <h3 className="text-cloud-white text-subheading font-semibold tracking-tight leading-snug">
          {item.title}
        </h3>
        {item.description ? (
          <p className="text-muted-silver text-caption mt-1 leading-snug line-clamp-2">
            {item.description}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
