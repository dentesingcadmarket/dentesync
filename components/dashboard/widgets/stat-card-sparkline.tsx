'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: number | string
  icon: LucideIcon
  color?: string
  trend?: number
  data?: Array<{ v: number }>
  subtitle?: string
}

export function StatCardSparkline({ label, value, icon: Icon, color = '#2dd4bf', trend, data, subtitle }: Props) {
  const hasData = Array.isArray(data) && data.length > 1 && data.some(d => d.v > 0)
  const trendUp = (trend ?? 0) >= 0
  const TrendIcon = trendUp ? ArrowUpRight : ArrowDownRight
  const gradId = `spark-${label.replace(/\W+/g, '')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="relative bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.14)] rounded-2xl p-4 overflow-hidden transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[#999999] text-xs font-medium">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}1f` }}>
          <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-semibold text-white tabular-nums">{value}</p>
          {(subtitle || trend !== undefined) && (
            <div className="flex items-center gap-1.5 mt-1">
              {trend !== undefined && (
                <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                  trendUp ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'
                )}>
                  <TrendIcon className="w-2.5 h-2.5" />
                  {Math.abs(trend)}%
                </span>
              )}
              {subtitle && <span className="text-[#999999] text-[10px]">{subtitle}</span>}
            </div>
          )}
        </div>

        {hasData && (
          <div className="w-20 h-10 shrink-0 opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#${gradId})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  )
}
