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
  badgeCls: string
  iconBg: string
}[] = [
  {
    type: 'consultation',
    icon: <MessageCircle className="w-5 h-5" />,
    label: 'Vaka Danışması',
    description: 'Vakanızı paylaşın, uzman görüşü alın',
    badge: 'DANIŞMA',
    badgeCls: 'bg-anchor-graphite0/20 text-anchor-graphite border-anchor-graphite0/30',
    iconBg: 'bg-anchor-graphite0/15 text-anchor-graphite',
  },
  {
    type: 'error_solution',
    icon: <AlertTriangle className="w-5 h-5" />,
    label: 'Hata Çözümü',
    description: 'Karşılaştığınız hatayı ve çözümünü paylaşın',
    badge: 'HATA → ÇÖZÜM',
    badgeCls: 'bg-anchor-graphite0/20 text-anchor-graphite border-anchor-graphite0/30',
    iconBg: 'bg-anchor-graphite0/15 text-anchor-graphite',
  },
  {
    type: 'material_review',
    icon: <Package className="w-5 h-5" />,
    label: 'Materyal Değerlendirmesi',
    description: 'Kullandığınız materyali puanlayın ve yorumlayın',
    badge: 'MATERYAL DEĞERLENDİRME',
    badgeCls: 'bg-primary0/20 text-primary border-primary0/30',
    iconBg: 'bg-primary0/15 text-primary',
  },
  {
    type: 'step_by_step',
    icon: <ListOrdered className="w-5 h-5" />,
    label: 'Step-by-Step',
    description: 'Vakanızı adım adım belgeleyin',
    badge: 'SÜREÇ',
    badgeCls: 'bg-primary0/20 text-primary border-primary0/30',
    iconBg: 'bg-primary0/15 text-primary',
  },
  {
    type: 'showcase',
    icon: <ImageIcon className="w-5 h-5" />,
    label: 'Showcase',
    description: 'Başarılı çalışmanızı sergileyin',
    badge: 'SHOWCASE',
    badgeCls: 'bg-white/10 text-[#999999] border-white/10',
    iconBg: 'bg-white/10 text-[#999999]',
  },
  {
    type: 'critique_request',
    icon: <Eye className="w-5 h-5" />,
    label: 'Kritik İsteği',
    description: 'Uzman görüşü için vakayı sunun',
    badge: 'KRİTİK İSTE',
    badgeCls: 'bg-primary0/20 text-primary border-primary0/30',
    iconBg: 'bg-primary0/15 text-primary',
  },
]

export function PostTypeSelector({ onSelect, onClose }: PostTypeSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(229,231,235,0.08)]">
          <div>
            <h2 className="text-[#ffffff] font-semibold">İçerik Tipi Seç</h2>
            <p className="text-[#999999] text-xs mt-0.5">Ne paylaşmak istiyorsunuz?</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#999999] hover:text-[#ffffff] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {POST_TYPES.map((pt, i) => (
            <motion.button
              key={pt.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(pt.type)}
              className="group flex items-start gap-3 p-4 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#1f1f20] transition-all text-left"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${pt.iconBg}`}>
                {pt.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pt.badgeCls}`}>
                    {pt.badge}
                  </span>
                </div>
                <p className="text-[#ffffff] text-sm font-medium leading-tight">{pt.label}</p>
                <p className="text-[#999999] text-xs mt-0.5 leading-relaxed">{pt.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
