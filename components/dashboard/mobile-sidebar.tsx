'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        {/* min 44px touch target — mobile-design requirement */}
        <button className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[#71717a] active:text-[#f4f4f5] transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-[#111114] border-r border-[rgba(255,255,255,0.07)]">
        {children}
      </SheetContent>
    </Sheet>
  )
}
