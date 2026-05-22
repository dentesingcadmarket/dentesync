'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  href: string
  icon: LucideIcon
  label: string
  tierBadge?: string
  exact?: boolean
}

/**
 * Icon-only sidebar nav item — minimalist, iPhone-style.
 * - 44x44 touch target, centered icon.
 * - Native title="" tooltip on hover (shows label).
 * - Active state: aqua tinted background + aqua icon.
 * - Tier badge: tiny aqua chip in top-right corner.
 */
export function NavItem({ href, icon: Icon, label, tierBadge, exact = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        'group relative flex items-center justify-center w-11 h-11 rounded-cards transition-all',
        isActive
          ? 'bg-morphic-aqua/15 text-morphic-aqua'
          : 'text-muted-silver hover:text-cloud-white hover:bg-white/[0.06]',
      )}
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
      {tierBadge ? (
        <span className="absolute -top-1 -right-1 text-[9px] leading-none px-1 py-0.5 rounded-full bg-morphic-aqua text-ebony-canvas font-bold tracking-tight">
          {tierBadge.replace('+', '')}
        </span>
      ) : null}
      {/* Active rail indicator on the left */}
      {isActive ? (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-morphic-aqua" />
      ) : null}
    </Link>
  )
}
