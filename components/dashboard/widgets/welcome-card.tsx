'use client'

import { motion } from 'framer-motion'
import { DentalIllustration } from './dental-illustration'
import { TierChip } from './tier-chip'

interface MiniStat {
  label: string
  value: number | string
  accent?: string
}

interface Props {
  greeting: string
  name?: string | null
  subtitle: string
  tier: 'm1' | 'm2' | 'm3'
  memberSince?: string | null
  miniStats?: MiniStat[]
}

export function WelcomeCard({ greeting, name, subtitle, tier, memberSince, miniStats = [] }: Props) {
  const firstName = name ? name.split(' ')[0] : ''
  const memberLabel = memberSince
    ? new Date(memberSince).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-[rgba(229,231,235,0.08)] bg-gradient-to-br from-[#0f1716] via-[#161617] to-[#161617]"
    >
      {/* Decorative aqua orb */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#2dd4bf]/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-8 bottom-0 w-48 h-48 rounded-full bg-[#2563eb]/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row gap-6 p-6 lg:p-8 items-start lg:items-center">
        {/* Left: greeting + mini stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl lg:text-[28px] font-semibold text-white leading-tight">
              {greeting}{firstName ? `, ${firstName}` : ''} <span className="inline-block">👋</span>
            </h1>
          </div>
          <p className="text-[#999999] text-sm mb-4">{subtitle}</p>

          <div className="flex items-center gap-2 flex-wrap mb-5">
            <TierChip tier={tier} />
            {memberLabel && (
              <span className="text-[#737373] text-xs">
                Üye: {memberLabel}
              </span>
            )}
          </div>

          {miniStats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {miniStats.map(s => (
                <div key={s.label} className="rounded-xl bg-black/30 border border-white/[0.05] px-3 py-2.5">
                  <p className="text-lg font-semibold text-white tabular-nums leading-none">{s.value}</p>
                  <p className="text-[10px] text-[#999999] mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: illustration */}
        <div className="shrink-0 w-full lg:w-[280px] -mb-6 lg:mb-0 -mr-2 lg:mr-0">
          <DentalIllustration className="w-full h-auto max-w-[280px] mx-auto" />
        </div>
      </div>
    </motion.div>
  )
}
