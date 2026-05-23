'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DentalMotif, type DentalMotif as DentalMotifType } from './dental-icons'
import { extractDominantColor, rgbString, type RGB } from '@/lib/dominant-color'

/** HSL (0-360, 0-1, 0-1) → RGB (0-255) — desaturated dark mood için kullanılır */
function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0]
  else if (hp < 2) [r, g, b] = [x, c, 0]
  else if (hp < 3) [r, g, b] = [0, c, x]
  else if (hp < 4) [r, g, b] = [0, x, c]
  else if (hp < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export interface GalleryTile {
  slug: string
  title: string
  /** Distinct hue per tile — used only as a fallback when no posterSrc is available */
  hue: number
  href: string
  videoSrc?: string | null
  posterSrc?: string | null
  /** Bento width — fixed height row, variable widths (140/200/260 etc.) */
  width: number
  /** Dental illustration motif overlaid on the tile */
  motif: DentalMotifType
}

interface ScrollGalleryProps {
  tiles: GalleryTile[]
  rows?: 1 | 2
  headerTitle?: string
  headerLogoSrc?: string
  seeMoreHref?: string
  seeMoreLabel?: string
}

/**
 * Morphic-style "Made with…" horizontal scrolling gallery.
 * Hovering a tile bleeds its REAL dominant color into a soft blurred backdrop.
 */
export function ScrollGallery({
  tiles,
  rows = 2,
  headerTitle,
  headerLogoSrc,
  seeMoreHref,
  seeMoreLabel = 'Hepsini gör',
}: ScrollGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const [activeColor, setActiveColor] = useState<RGB | null>(null)

  const rowBuckets: GalleryTile[][] = Array.from({ length: rows }, () => [])
  tiles.forEach((tile, i) => {
    rowBuckets[i % rows].push(tile)
  })

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

  const reflectionBg = activeColor
    ? `radial-gradient(60% 80% at 50% 50%, ${rgbString(activeColor, 0.55)} 0%, ${rgbString(activeColor, 0.22)} 45%, transparent 75%)`
    : 'transparent'

  return (
    <div className="relative group/gallery">
      {/* Backdrop reflection — adopts the hovered tile's real dominant color */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-12 -inset-y-24 pointer-events-none z-0"
        style={{
          background: reflectionBg,
          opacity: activeColor !== null ? 1 : 0,
          filter: 'blur(60px) saturate(1.15)',
          transition: 'opacity 400ms ease, background 400ms ease',
        }}
      />

      {headerTitle ? (
        <div className="relative z-20 max-w-7xl mx-auto px-6 mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-pill bg-charcoal-surface/60 border border-white/[0.08] backdrop-blur-md">
            {headerLogoSrc ? (
              <Image
                src={headerLogoSrc}
                alt=""
                width={18}
                height={18}
                className="rounded-sm opacity-90"
              />
            ) : null}
            <span className="text-cloud-white text-caption font-medium tracking-tight">{headerTitle}</span>
            {seeMoreHref ? (
              <>
                <span aria-hidden="true" className="h-3 w-px bg-white/15" />
                <Link
                  href={seeMoreHref}
                  className="text-muted-silver text-caption hover:text-cloud-white transition-colors"
                >
                  {seeMoreLabel}
                </Link>
              </>
            ) : null}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              aria-label="Sola kaydır"
              onClick={() => scrollByAmount(-1)}
              disabled={!canPrev}
              className={cn(
                'inline-flex items-center justify-center w-9 h-9 rounded-pill bg-charcoal-surface/80 border border-white/[0.08] text-cloud-white transition-colors',
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
                'inline-flex items-center justify-center w-9 h-9 rounded-pill bg-charcoal-surface/80 border border-white/[0.08] text-cloud-white transition-colors',
                canNext ? 'hover:bg-charcoal-surface cursor-pointer' : 'opacity-40 cursor-not-allowed',
              )}
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ebony-canvas to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ebony-canvas to-transparent z-20" />

      <div
        ref={scrollerRef}
        className="relative z-10 overflow-x-auto overflow-y-hidden scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex flex-col gap-2 pl-6 pr-6 min-w-max">
          {rowBuckets.map((row, ri) => (
            <div key={ri} className="flex gap-2">
              {row.map(tile => (
                <GalleryTileItem
                  key={tile.slug}
                  tile={tile}
                  onActivate={color => setActiveColor(color)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface GalleryTileItemProps {
  tile: GalleryTile
  onActivate: (color: RGB | null) => void
}

function GalleryTileItem({ tile, onActivate }: GalleryTileItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [dominant, setDominant] = useState<RGB | null>(null)

  useEffect(() => {
    if (!tile.posterSrc) return
    let cancelled = false
    extractDominantColor(tile.posterSrc).then(color => {
      if (!cancelled) setDominant(color)
    })
    return () => {
      cancelled = true
    }
  }, [tile.posterSrc])

  // Per-tile desaturated dark mood (sinematik) — neon değil, ama renk hissi var
  const fallbackColor: RGB = hslToRgb(tile.hue, 0.40, 0.34)

  const activeColor: RGB = dominant ?? fallbackColor

  const handleEnter = () => {
    setHovered(true)
    onActivate(activeColor)
    if (videoRef.current) videoRef.current.play().catch(() => undefined)
  }
  const handleLeave = () => {
    setHovered(false)
    onActivate(null)
    if (videoRef.current) videoRef.current.pause()
  }

  const placeholderBg = `rgb(${activeColor.r}, ${activeColor.g}, ${activeColor.b})`

  return (
    <Link
      href={tile.href}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onTouchStart={handleEnter}
      onTouchEnd={handleLeave}
      onTouchCancel={handleLeave}
      title={tile.title}
      style={{ width: `${tile.width}px` }}
      className="group/tile relative shrink-0 h-[128px] sm:h-[148px] rounded-[14px] overflow-hidden border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
    >
      <div className="absolute inset-0 bg-ebony-canvas" />

      {tile.posterSrc ? (
        <>
          {/* Placeholder filled with dominant color — fades out when image loads */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundColor: placeholderBg,
              opacity: imageLoaded ? 0 : 1,
              transition: 'opacity 400ms ease',
            }}
          />
          {/* Real image with lazy + async + crossOrigin so canvas can read pixels */}
          <img
            src={tile.posterSrc}
            alt=""
            loading="lazy"
            decoding="async"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/tile:scale-[1.04]"
            style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 400ms ease, transform 500ms ease' }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 90% at 30% 35%, ${rgbString(fallbackColor, 0.55)} 0%, transparent 55%), radial-gradient(140% 100% at 75% 70%, ${rgbString(fallbackColor, 0.38)} 0%, transparent 60%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-cloud-white/65 group-hover/tile:text-cloud-white/85 transition-colors">
            <DentalMotif
              motif={tile.motif}
              className="w-11 h-11 sm:w-14 sm:h-14 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            />
          </div>
        </>
      )}

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />

      {tile.videoSrc ? (
        <video
          ref={videoRef}
          src={tile.videoSrc}
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

      <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/[0.06] pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ebony-canvas via-ebony-canvas/40 to-transparent pt-10 pb-2.5 px-3 opacity-0 group-hover/tile:opacity-100 transition-opacity duration-200">
        <p className="text-cloud-white text-caption font-medium leading-tight line-clamp-2 tracking-tight">
          {tile.title}
        </p>
      </div>
    </Link>
  )
}
