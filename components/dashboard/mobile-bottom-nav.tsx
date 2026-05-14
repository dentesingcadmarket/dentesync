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
    /* lg:hidden — sadece mobil görünür | pb-safe — home indicator alanı */
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#111114] border-t border-[rgba(255,255,255,0.07)] pb-safe">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              /* min 44px touch target per mobile-design — kullanıcı başarısız dokunuşları önler */
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-1 transition-colors active:scale-95 ${
                active ? 'text-[#2563eb]' : 'text-[#71717a]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#2563eb]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
