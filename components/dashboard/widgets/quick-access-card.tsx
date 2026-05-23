'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  href: string
  icon: LucideIcon
  label: string
  desc: string
  color?: string
  badge?: string
  locked?: boolean
  onClick?: () => void
}

export function QuickAccessCard({ href, icon: Icon, label, desc, color = '#2dd4bf', badge, locked, onClick }: Props) {
  const targetHref = locked ? '/dashboard?upgrade=true&requiredTier=m2' : href

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Link
        href={targetHref}
        onClick={onClick}
        className="group relative flex flex-col gap-3 bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(45,212,191,0.30)] rounded-2xl p-4 transition-all overflow-hidden h-full"
      >
        {/* Subtle gradient glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: `radial-gradient(80% 60% at 100% 0%, ${color}12, transparent 60%)` }}
        />

        {badge && (
          <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[#999999]/15 text-[#999999] font-medium">
            {badge}
          </span>
        )}

        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}22, ${color}0a)`, border: `1px solid ${color}28` }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color }} strokeWidth={1.75} />
        </div>

        <div className="relative">
          <p className={cn('text-white text-sm font-medium', locked && 'opacity-70')}>{label}</p>
          <p className="text-[#999999] text-xs mt-0.5">{desc}</p>
        </div>

        <ArrowRight className="relative w-3.5 h-3.5 text-[#525252] group-hover:text-[#2dd4bf] group-hover:translate-x-0.5 transition-all mt-auto" />
      </Link>
    </motion.div>
  )
}
