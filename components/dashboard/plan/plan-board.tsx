'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Trash2,
  RotateCcw,
  ChevronRight,
  Map,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateStepStatus, deletePlanStep, clearPlan } from '@/app/actions/plan'
import type { PlanStep } from '@/app/actions/plan'

interface PlanBoardProps {
  steps: PlanStep[]
  onStepCompleted: (completedTitle: string) => void
  onClearPlan: () => void
}

const STATUS_CONFIG = {
  pending: {
    label: 'Bekliyor',
    icon: Clock,
    color: 'text-[#71717a]',
    bg: 'bg-[#71717a]/10',
    border: 'border-[#71717a]/20',
    badge: 'text-[#71717a]',
  },
  in_progress: {
    label: 'Devam Ediyor',
    icon: PlayCircle,
    color: 'text-[#f59e0b]',
    bg: 'bg-[#f59e0b]/10',
    border: 'border-[#f59e0b]/20',
    badge: 'text-[#f59e0b]',
  },
  completed: {
    label: 'Tamamlandı',
    icon: CheckCircle2,
    color: 'text-[#10b981]',
    bg: 'bg-[#10b981]/10',
    border: 'border-[#10b981]/20',
    badge: 'text-[#10b981]',
  },
} as const

function StepCard({
  step,
  onComplete,
  onDelete,
  onStart,
}: {
  step: PlanStep
  onComplete: (step: PlanStep) => void
  onDelete: (id: string) => void
  onStart: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[step.status]
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl border p-4 transition-colors ${
        step.status === 'completed'
          ? 'bg-[#10b981]/5 border-[#10b981]/15 opacity-70'
          : 'bg-[#111114] border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Step number */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${cfg.bg} ${cfg.badge}`}>
          {step.step_number}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-sm font-medium leading-tight ${
              step.status === 'completed' ? 'line-through text-[#71717a]' : 'text-[#f4f4f5]'
            }`}>
              {step.title}
            </p>
          </div>
          {step.description && (
            <p className="text-xs text-[#71717a] leading-relaxed mb-2">{step.description}</p>
          )}
          <div className="flex items-center gap-1.5">
            <Icon className={`w-3 h-3 ${cfg.color}`} />
            <span className={`text-[10px] ${cfg.badge}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {step.status === 'pending' && (
            <button
              onClick={() => onStart(step.id)}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors"
              title="Başlat"
            >
              <PlayCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {step.status === 'in_progress' && (
            <button
              onClick={() => onComplete(step)}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-[#10b981] hover:bg-[#10b981]/10 transition-colors"
              title="Tamamla"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
          {step.status === 'completed' && (
            <button
              onClick={() => onStart(step.id)}
              className="p-1.5 rounded-lg text-[#71717a] hover:text-[#71717a]/80 hover:bg-white/5 transition-colors"
              title="Geri al"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(step.id)}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sil"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function PlanBoard({ steps, onStepCompleted, onClearPlan }: PlanBoardProps) {
  const [isPending, startTransition] = useTransition()
  const [clearConfirm, setClearConfirm] = useState(false)

  const completedCount = steps.filter(s => s.status === 'completed').length
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0

  function handleStart(id: string) {
    startTransition(async () => {
      const result = await updateStepStatus(id, 'in_progress')
      if (result.error) toast.error(result.error)
    })
  }

  function handleComplete(step: PlanStep) {
    startTransition(async () => {
      const result = await updateStepStatus(step.id, 'completed')
      if (result.error) { toast.error(result.error); return }
      onStepCompleted(step.title)
      toast.success('Adım tamamlandı! Sonraki adım oluşturuluyor...')
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePlanStep(id)
      if (result.error) toast.error(result.error)
    })
  }

  function handleClear() {
    if (!clearConfirm) { setClearConfirm(true); return }
    startTransition(async () => {
      const result = await clearPlan()
      if (result.error) { toast.error(result.error); return }
      onClearPlan()
      setClearConfirm(false)
      toast.success('Plan sıfırlandı.')
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.07)] shrink-0">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-[#2563eb]" />
          <span className="text-[#f4f4f5] text-sm font-medium">Planım</span>
          {steps.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2563eb]/15 text-[#2563eb]">
              {steps.length} adım
            </span>
          )}
        </div>
        {steps.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isPending}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
              clearConfirm
                ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                : 'text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1a1a1f]'
            }`}
          >
            {clearConfirm ? 'Emin misin?' : 'Sıfırla'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {steps.length > 0 && (
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#71717a]">
              {completedCount}/{steps.length} tamamlandı
            </span>
            <span className="text-[10px] text-[#71717a]">{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-[#1a1a1f] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#10b981]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 min-h-0">
        {steps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] flex items-center justify-center mb-3">
              <ChevronRight className="w-5 h-5 text-[#71717a]" />
            </div>
            <p className="text-[#71717a] text-xs max-w-[160px] leading-relaxed">
              Sohbet asistanına hedefini anlat, adımlar burada görünecek.
            </p>
          </div>
        ) : (
          <>
            {isPending && (
              <div className="flex items-center gap-2 text-[#71717a] text-xs py-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Güncelleniyor...
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {steps.map(step => (
                <StepCard
                  key={step.id}
                  step={step}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onStart={handleStart}
                />
              ))}
            </AnimatePresence>

            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 p-4 text-center mt-2"
              >
                <CheckCircle2 className="w-5 h-5 text-[#10b981] mx-auto mb-1.5" />
                <p className="text-[#10b981] text-sm font-medium">Plan Tamamlandı!</p>
                <p className="text-[#71717a] text-xs mt-0.5">Tüm adımları başarıyla tamamladın.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
