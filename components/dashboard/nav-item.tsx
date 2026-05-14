'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  href: string
  icon: LucideIcon
  label: string
  tierBadge?: string
  exact?: boolean
}

export function NavItem({ href, icon: Icon, label, tierBadge, exact = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-xl text-sm transition-colors group',
          isActive
            ? 'bg-[#1a1a1f] text-[#f4f4f5] border-l-2 border-[#2563eb] pl-[10px]'
            : 'text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1a1a1f]/60'
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#2563eb]' : 'text-[#71717a] group-hover:text-[#f4f4f5]')} />
        <span className="flex-1 truncate">{label}</span>
        {tierBadge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2563eb]/15 text-[#2563eb] font-medium shrink-0">
            {tierBadge}
          </span>
        )}
      </Link>
    </motion.div>
  )
}
