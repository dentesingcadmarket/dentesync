'use client'

import { useState } from 'react'
import { ShowcaseCard, type ShowcaseItem } from './showcase-card'

interface ShowcaseFanProps {
  items: ShowcaseItem[]
}

const BASE_TILTS = ['-9deg', '-3deg', '3deg', '9deg']
const SPREAD_TILTS = ['-16deg', '-7deg', '7deg', '16deg']
const OFFSETS = ['-mr-12 sm:-mr-16', '-mr-12 sm:-mr-16', '-mr-12 sm:-mr-16', '']

export function ShowcaseFan({ items }: ShowcaseFanProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const slice = items.slice(0, 4)

  return (
    <div className="relative flex justify-center items-center min-h-[480px] sm:min-h-[540px]">
      {slice.map((item, idx) => {
        const isHovered = hoveredIdx === idx
        const isOther = hoveredIdx !== null && hoveredIdx !== idx
        const tilt = isHovered ? '0deg' : isOther ? SPREAD_TILTS[idx] : BASE_TILTS[idx]
        const scale = isHovered ? 1.08 : isOther ? 0.94 : 1
        const z = isHovered ? 50 : idx + 1
        const opacity = isOther ? 0.78 : 1

        return (
          <div
            key={item.slug}
            className={`relative ${OFFSETS[idx]}`}
            style={{
              zIndex: z,
              transform: `rotate(${tilt}) scale(${scale})`,
              opacity,
              transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease',
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onFocus={() => setHoveredIdx(idx)}
            onBlur={() => setHoveredIdx(null)}
          >
            <ShowcaseCard
              item={item}
              className="aspect-[3/4] w-[180px] sm:w-[240px] lg:w-[280px] rounded-hero shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
            />
          </div>
        )
      })}
    </div>
  )
}
