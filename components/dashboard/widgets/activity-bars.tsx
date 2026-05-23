'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, Tooltip } from 'recharts'

interface Datum {
  day: string
  v: number
}

interface Props {
  data: Datum[]
  color?: string
  height?: number
}

const DAY_LABELS = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']

export function ActivityBars({ data, color = '#2dd4bf', height = 110 }: Props) {
  const hasData = data.some(d => d.v > 0)
  const max = Math.max(1, ...data.map(d => d.v))

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barCategoryGap="22%">
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            stroke="#525252"
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{
              background: '#1f1f20',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              fontSize: 11,
              color: '#fff',
            }}
            labelStyle={{ color: '#999' }}
          />
          <Bar dataKey="v" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={hasData ? (d.v === max ? color : `${color}88`) : '#1f1f20'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { DAY_LABELS }
