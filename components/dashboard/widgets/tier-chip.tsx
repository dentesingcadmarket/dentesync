import { cn } from '@/lib/utils'

type Tier = 'm1' | 'm2' | 'm3'

const TIER_LABEL: Record<Tier, string> = { m1: 'M1 Başlangıç', m2: 'M2 Pro', m3: 'M3 İşletme' }
const TIER_COLOR: Record<Tier, string> = {
  m1: 'text-[#999999] bg-white/5 border-white/10',
  m2: 'text-[#2dd4bf] bg-[#2dd4bf]/10 border-[#2dd4bf]/20',
  m3: 'text-[#2dd4bf] bg-gradient-to-r from-[#2dd4bf]/15 to-[#2563eb]/15 border-[#2dd4bf]/30',
}

export function TierChip({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span className={cn('inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border', TIER_COLOR[tier], className)}>
      {TIER_LABEL[tier]}
    </span>
  )
}

export { TIER_LABEL }
