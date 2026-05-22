'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface SectionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Distance in px from which the content slides up (default 20) */
  offset?: number
}

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function SectionReveal({ children, className, delay = 0, offset = 20 }: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      custom={delay}
      variants={{
        hidden: { opacity: 0, y: offset },
        visible: variants.visible,
      }}
    >
      {children}
    </motion.div>
  )
}
