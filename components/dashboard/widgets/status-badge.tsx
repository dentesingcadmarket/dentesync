import { AlertCircle, Clock, CheckCircle2, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'open' | 'in_progress' | 'completed' | 'archived'

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof AlertCircle }> = {
  open: { label: 'Açık', color: 'text-[#2dd4bf]', bg: 'bg-[#2dd4bf]/15', icon: AlertCircle },
  in_progress: { label: 'Devam Ediyor', color: 'text-[#2563eb]', bg: 'bg-[#2563eb]/15', icon: Clock },
  completed: { label: 'Tamamlandı', color: 'text-[#22c55e]', bg: 'bg-[#22c55e]/15', icon: CheckCircle2 },
  archived: { label: 'Arşiv', color: 'text-[#999999]', bg: 'bg-[#737373]/15', icon: Archive },
}

export function StatusBadge({ status, size = 'sm', showIcon = true }: { status: Status; size?: 'xs' | 'sm' | 'md'; showIcon?: boolean }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open
  const Icon = cfg.icon
  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1',
    sm: 'text-[10px] px-2 py-1 gap-1.5',
    md: 'text-xs px-2.5 py-1.5 gap-1.5',
  }[size]
  const iconSize = { xs: 'w-2.5 h-2.5', sm: 'w-3 h-3', md: 'w-3.5 h-3.5' }[size]

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', cfg.color, cfg.bg, sizeClasses)}>
      {showIcon && <Icon className={iconSize} />}
      {cfg.label}
    </span>
  )
}

export { STATUS_CONFIG }
