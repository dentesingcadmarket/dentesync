export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'
import { UpgradeModal } from '@/components/dashboard/upgrade-modal'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="h-[100dvh] bg-ebony-canvas flex overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile topbar — pt-safe for notch */}
        <header className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-outline-haze/[0.06] bg-nightfall-gray shrink-0 pt-safe">
          <MobileSidebar>
            <Sidebar />
          </MobileSidebar>
          <span className="text-cloud-white font-semibold text-body">DenteSync</span>
        </header>

        {/* pb-16 lg:pb-0 — bottom nav için alan */}
        <main className="flex-1 overflow-auto min-h-0 pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — thumb zone, primary CTAs */}
      <MobileBottomNav />

      {/* Upgrade modal */}
      <Suspense>
        <UpgradeModal />
      </Suspense>
    </div>
  )
}
