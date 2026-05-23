'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Terminal, FolderOpen, Users, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Ana Sayfa', exact: true },
  { href: '/dashboard/search/console', icon: Terminal, label: 'D-Console', exact: false },
  { href: '/dashboard/case-management', icon: FolderOpen, label: 'Vakalar', exact: false },
  { href: '/dashboard/community', icon: Users, label: 'Topluluk', exact: false },
  { href: '/dashboard/settings', icon: Settings, label: 'Ayarlar', exact: false },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex-1 flex flex-col items-center justify-center min-h-[60px] gap-1 transition-all active:scale-95 ${
                active ? 'text-[#2dd4bf]' : 'text-[#737373] hover:text-[#999999]'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              )}
              <div className={`relative flex items-center justify-center transition-transform ${active ? 'scale-110' : ''}`}>
                {active && (
                  <span className="absolute inset-0 -m-1.5 rounded-lg bg-[#2dd4bf]/12 blur-sm" />
                )}
                <Icon className="relative w-5 h-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              </div>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
