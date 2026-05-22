import { cn } from '@/lib/utils'

type Intensity = 'hero' | 'capability' | 'cta' | 'tile'

interface BackgroundVisualProps {
  /**
   * Optional video URL. When provided, an autoplaying muted-loop <video> renders behind content.
   * When undefined, only the blurred gradient placeholder is shown.
   * TODO: Kullanıcı sonra dolduracak — örn. "/videos/hero.webm"
   */
  videoSrc?: string
  /**
   * Poster image (shown before video loads OR as the only background when videoSrc is undefined).
   * If omitted, a CSS-only blurred gradient is used.
   */
  posterSrc?: string
  intensity?: Intensity
  className?: string
  /** Override the radial glow tint. Defaults to teal. */
  glowColor?: string
}

const intensityClasses: Record<Intensity, string> = {
  hero: 'opacity-100',
  capability: 'opacity-80',
  cta: 'opacity-90',
  tile: 'opacity-100',
}

/**
 * Morphic-style backdrop layer.
 * - Hero/Capability/CTA: large blurred backdrop behind the section.
 * - Tile: full-bleed visual inside a workflow card.
 *
 * Stays under content with `pointer-events-none` (Tile variant is interactive via parent <Link>).
 */
export function BackgroundVisual({
  videoSrc,
  posterSrc,
  intensity = 'hero',
  className,
  glowColor = 'rgba(34, 211, 238, 0.18)',
}: BackgroundVisualProps) {
  const isTile = intensity === 'tile'
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden',
        !isTile && 'pointer-events-none',
        intensityClasses[intensity],
        className,
      )}
      aria-hidden="true"
    >
      {/* Base gradient — always visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#161617] via-[#0a0a0a] to-[#000000]" />

      {/* Radial teal glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      {/* Optional poster image — blurred underneath video */}
      {posterSrc ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center scale-110 blur-2xl opacity-60"
          style={{ backgroundImage: `url(${posterSrc})` }}
        />
      ) : null}

      {/* Optional video — fades in on top of poster/gradient */}
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            isTile ? 'opacity-100' : 'opacity-60',
          )}
        />
      ) : null}

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/40" />

      {/* Grain noise — subtle film texture */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />
    </div>
  )
}
