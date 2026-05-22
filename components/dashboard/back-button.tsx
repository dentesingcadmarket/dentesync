'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  className?: string
}

export function BackButton({ href, className = '' }: BackButtonProps) {
  const router = useRouter()

  function handleClick() {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`mt-1 p-2 rounded-xl text-[#999999] hover:text-[#ffffff] hover:bg-[#1f1f20] transition-colors cursor-pointer ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
    </motion.button>
  )
}
