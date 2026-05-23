import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  icon: LucideIcon
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  onCta?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function EmptyState({ icon: Icon, title, subtitle, ctaLabel, ctaHref, onCta, size = 'md', className }: Props) {
  const sizes = {
    sm: { padding: 'py-6', iconWrap: 'w-12 h-12', icon: 'w-5 h-5', title: 'text-sm', subtitle: 'text-xs' },
    md: { padding: 'py-10', iconWrap: 'w-16 h-16', icon: 'w-7 h-7', title: 'text-base', subtitle: 'text-sm' },
    lg: { padding: 'py-16', iconWrap: 'w-20 h-20', icon: 'w-9 h-9', title: 'text-lg', subtitle: 'text-sm' },
  }[size]

  const cta = ctaLabel ? (
    ctaHref ? (
      <Link href={ctaHref} className="inline-block mt-3 text-[#2dd4bf] text-xs hover:underline">
        {ctaLabel}
      </Link>
    ) : (
      <button type="button" onClick={onCta} className="mt-3 text-[#2dd4bf] text-xs hover:underline cursor-pointer">
        {ctaLabel}
      </button>
    )
  ) : null

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', sizes.padding, className)}>
      <div className={cn('rounded-2xl bg-gradient-to-br from-[#2dd4bf]/10 to-[#161617] border border-[rgba(229,231,235,0.08)] flex items-center justify-center mb-3', sizes.iconWrap)}>
        <Icon className={cn('text-[#2dd4bf]', sizes.icon)} strokeWidth={1.5} />
      </div>
      <p className={cn('text-[#ffffff] font-medium', sizes.title)}>{title}</p>
      {subtitle && <p className={cn('text-[#999999] mt-1 max-w-xs', sizes.subtitle)}>{subtitle}</p>}
      {cta}
    </div>
  )
}
