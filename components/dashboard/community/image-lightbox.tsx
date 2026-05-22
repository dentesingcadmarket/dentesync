'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface LightboxProps {
  src: string
  onClose: () => void
}

export function ImageLightbox({ src, onClose }: LightboxProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.img
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.15 }}
        src={src}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </motion.div>
  )
}
