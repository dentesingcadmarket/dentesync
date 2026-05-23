'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  actionLabel?: string
  actionHref?: string
  children: React.ReactNode
  icon?: LucideIcon
  className?: string
}

export function MiniListCard({ title, actionLabel, actionHref, children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl p-5 flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="text-[#2dd4bf] text-xs hover:underline">
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  )
}
