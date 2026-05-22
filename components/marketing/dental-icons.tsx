/**
 * Stylised dental motif illustrations for the marketing gallery tiles.
 * All paths use currentColor + stroke-based line art so they tint with parent text color.
 * 64x64 viewBox, strokeWidth ~1.5 — looks clean at 80–120px display size.
 */

interface IconProps {
  className?: string
}

const baseProps = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ToothIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Anterior tooth — crown + two roots */}
      <path d="M32 8c-7 0-14 4-14 13 0 4 1 7 2 10l3 9c0.5 2 2 3 4 3s3-1 3.5-3l1.5-7 1.5 7c0.5 2 2 3 3.5 3s3.5-1 4-3l3-9c1-3 2-6 2-10 0-9-7-13-14-13z" />
      <path d="M22 22c2 1 5 1.5 10 1.5s8-0.5 10-1.5" opacity="0.5" />
    </svg>
  )
}

export function MolarIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Posterior molar — wide crown + 3 roots + occlusal cusps */}
      <path d="M14 14c0-4 4-6 8-6 3 0 4 1 5 2 1 1 2 2 5 2s4-1 5-2 2-2 5-2c4 0 8 2 8 6 0 5-1 8-2 12l-3 12c-0.5 2-2 3-3.5 3s-3-1-3.5-3l-1-7c-0.3-2-1.5-2-2-2s-1.7 0-2 2l-1 6.5c-0.5 2-2 3-3 3s-2.5-1-3-3l-1-6.5c-0.3-2-1.5-2-2-2s-1.7 0-2 2l-1 7c-0.5 2-2 3-3.5 3s-3-1-3.5-3l-3-12c-1-4-2-7-2-12z" />
      {/* Occlusal cusp lines */}
      <path d="M21 16c2 0 3 2 3 3M43 16c-2 0-3 2-3 3M32 17v4" opacity="0.4" />
    </svg>
  )
}

export function CrownIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Standalone crown — no roots, with hollow interior */}
      <path d="M16 22c0-7 7-12 16-12s16 5 16 12c0 5-1 9-3 13l-3 12c-0.5 2-2 3-3 3h-14c-1 0-2.5-1-3-3l-3-12c-2-4-3-8-3-13z" />
      {/* Hollow interior outline */}
      <path d="M22 25c0-4 5-8 10-8s10 4 10 8c0 3-1 6-2 9l-2 8h-12l-2-8c-1-3-2-6-2-9z" opacity="0.5" />
      {/* Cement line at base */}
      <path d="M22 50h20" opacity="0.6" />
    </svg>
  )
}

export function BridgeIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 3-unit bridge: 2 anchor crowns + 1 pontic */}
      {/* Left anchor */}
      <path d="M8 22c0-5 4-8 8-8s8 3 8 8c0 4-1 7-2 10l-2 10c-0.5 1.5-1.5 2-2 2h-4c-0.5 0-1.5-0.5-2-2l-2-10c-1-3-2-6-2-10z" />
      {/* Pontic (middle, suspended) */}
      <path d="M24 24c0-3 4-5 8-5s8 2 8 5c0 3-1 6-2 8l-2 9c-0.3 1-1 1.5-1.5 1.5h-5c-0.5 0-1.2-0.5-1.5-1.5l-2-9c-1-2-2-5-2-8z" />
      {/* Right anchor */}
      <path d="M40 22c0-5 4-8 8-8s8 3 8 8c0 4-1 7-2 10l-2 10c-0.5 1.5-1.5 2-2 2h-4c-0.5 0-1.5-0.5-2-2l-2-10c-1-3-2-6-2-10z" />
      {/* Connector line at top */}
      <path d="M14 22h36" opacity="0.4" />
    </svg>
  )
}

export function ImplantIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Dental implant — crown + abutment + screw fixture */}
      {/* Crown */}
      <path d="M22 8c0-2 4-3 10-3s10 1 10 3c0 4-1 7-2 10l-1 4h-14l-1-4c-1-3-2-6-2-10z" />
      {/* Abutment (small cylinder) */}
      <path d="M27 22h10v6h-10z" />
      <path d="M27 25h10" opacity="0.5" />
      {/* Implant screw — threads */}
      <path d="M26 28h12l-1 18c-0.5 4-3 8-5 8s-4.5-4-5-8z" />
      <path d="M27 32h10M27 36h10M27 40h10M28 44h8M29 48h6" opacity="0.6" />
    </svg>
  )
}

export function DentureIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Full upper denture — arch with multiple teeth */}
      {/* Palate / acrylic base */}
      <path d="M10 28c0-12 10-20 22-20s22 8 22 20c0 6-2 11-4 14h-36c-2-3-4-8-4-14z" />
      {/* Tooth row — 7 teeth across the arch */}
      <path d="M14 28c0.5 4 1.5 7 3 9" opacity="0.6" />
      <path d="M20 32c0.3 3 1 5 1.8 7" opacity="0.6" />
      <path d="M26 34c0.2 3 0.6 5 1.2 7" opacity="0.6" />
      <path d="M32 35v7" opacity="0.6" />
      <path d="M38 34c-0.2 3-0.6 5-1.2 7" opacity="0.6" />
      <path d="M44 32c-0.3 3-1 5-1.8 7" opacity="0.6" />
      <path d="M50 28c-0.5 4-1.5 7-3 9" opacity="0.6" />
      {/* Gum line */}
      <path d="M12 30c5-2 14-3 20-3s15 1 20 3" opacity="0.4" />
    </svg>
  )
}

export type DentalMotif = 'tooth' | 'molar' | 'crown' | 'bridge' | 'implant' | 'denture'

export function DentalMotif({
  motif,
  className,
}: {
  motif: DentalMotif
  className?: string
}) {
  switch (motif) {
    case 'tooth':
      return <ToothIcon className={className} />
    case 'molar':
      return <MolarIcon className={className} />
    case 'crown':
      return <CrownIcon className={className} />
    case 'bridge':
      return <BridgeIcon className={className} />
    case 'implant':
      return <ImplantIcon className={className} />
    case 'denture':
      return <DentureIcon className={className} />
  }
}
