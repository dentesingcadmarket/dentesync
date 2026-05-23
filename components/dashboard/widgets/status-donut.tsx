'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface Slice {
  name: string
  value: number
  color: string
}

interface Props {
  data: Slice[]
  total: number
  centerLabel?: string
  size?: number
}

export function StatusDonut({ data, total, centerLabel, size = 140 }: Props) {
  const hasData = total > 0
  const fallback: Slice[] = [{ name: 'Boş', value: 1, color: '#1f1f20' }]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={hasData ? data : fallback}
            innerRadius={size * 0.32}
            outerRadius={size * 0.48}
            paddingAngle={hasData ? 3 : 0}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            {(hasData ? data : fallback).map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-semibold text-white tabular-nums">{total}</span>
        {centerLabel && <span className="text-[10px] text-[#999999] mt-0.5">{centerLabel}</span>}
      </div>
    </div>
  )
}

export function StatusDonutLegend({ data }: { data: Slice[] }) {
  return (
    <ul className="space-y-2">
      {data.map(s => (
        <li key={s.name} className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-[#999999]">{s.name}</span>
          </span>
          <span className="text-white font-medium tabular-nums">{s.value}</span>
        </li>
      ))}
    </ul>
  )
}
