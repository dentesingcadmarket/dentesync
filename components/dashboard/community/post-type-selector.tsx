'use client'

import { motion } from 'framer-motion'
import { MessageCircle, AlertTriangle, Package, ListOrdered, Image as ImageIcon, Eye, X } from 'lucide-react'
import type { PostType } from '@/lib/supabase/types'

interface PostTypeSelectorProps {
  onSelect: (type: PostType) => void
  onClose: () => void
}

const POST_TYPES: {
  type: PostType
  icon: React.ReactNode
  label: string
  description: string
  badge: string
  color: string
}[] = [
  {
    type: 'consultation',
    icon: <MessageCircle className="w-5 h-5" />,
    label: 'Vaka Danışması',
    description: 'Vakanızı paylaşın, uzman görüşü alın',
    badge: 'DANIŞMA',
    color: '#2dd4bf',
  },
  {
    type: 'error_solution',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Hata Çözümü',
    description: 'Karşılaştığınız hatayı ve çözümünü paylaşın',
    badge: 'HATA → ÇÖZÜM',
    color: '#fbbf24',
  },
  {
    type: 'material_review',
    icon: <Package className="w-5 h-5" />,
    label: 'Materyal Değerlendirmesi',
    description: 'Kullandığınız materyali puanlayın ve yorumlayın',
    badge: 'MATERYAL DEĞERLENDİRME',
    color: '#a78bfa',
  },
  {
    type: 'step_by_step',
    icon: <ListOrdered className="w-5 h-5" />,
    label: 'Step-by-Step',
    description: 'Vakanızı adım adım belgeleyin',
    badge: 'SÜREÇ',
    color: '#2563eb',
  },
  {
    type: 'showcase',
    icon: <ImageIcon className="w-5 h-5" />,
    label: 'Showcase',
    description: 'Başarılı çalışmanızı sergileyin',
    badge: 'SHOWCASE',
    color: '#22c55e',
  },
  {
    type: 'critique_request',
    icon: <Eye className="w-5 h-5" />,
    label: 'Kritik İsteği',
    description: 'Uzman görüşü için vakayı sunun',
    badge: 'KRİTİK İSTE',
    color: '#f97316',
  },
]

export function PostTypeSelector({ onSelect, onClose }: PostTypeSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl bg-[#161617] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-gradient-to-r from-[#2dd4bf]/8 to-transparent">
          <div>
            <h2 className="text-white font-semibold">İçerik Tipi Seç</h2>
            <p className="text-[#999999] text-xs mt-0.5">Ne paylaşmak istiyorsunuz?</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#999999] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
          {POST_TYPES.map((pt, i) => (
            <motion.button
              key={pt.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(pt.type)}
              className="group relative flex items-start gap-3 p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.18] transition-all text-left overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(70% 60% at 100% 0%, ${pt.color}14, transparent 70%)` }}
              />
              <div
                className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${pt.color}28, ${pt.color}0a)`, color: pt.color, border: `1px solid ${pt.color}30` }}
              >
                {pt.icon}
              </div>
              <div className="relative min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                    style={{ background: `${pt.color}15`, color: pt.color, borderColor: `${pt.color}30` }}
                  >
                    {pt.badge}
                  </span>
                </div>
                <p className="text-white text-sm font-medium leading-tight">{pt.label}</p>
                <p className="text-[#999999] text-xs mt-0.5 leading-relaxed">{pt.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
