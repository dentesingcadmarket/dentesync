'use client'

import {
  LayoutDashboard,
  Terminal,
  Map,
  FolderOpen,
  AlertTriangle,
  Dumbbell,
  Users,
  ShoppingBag,
  Newspaper,
  HelpCircle,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'
import { NavItem } from './nav-item'

/**
 * Icon-only sidebar navigation.
 * Sections are separated by a thin divider line (not labelled — labels live in tooltips).
 */
export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto py-3 flex flex-col items-center gap-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" exact />

      <SectionDivider />
      <NavItem href="/dashboard/search/console" icon={Terminal} label="D-Console" />
      <NavItem href="/dashboard/search/plan" icon={Map} label="Planım" />

      <SectionDivider />
      <NavItem href="/dashboard/case-management" icon={FolderOpen} label="Tüm Vakalar" />
      <NavItem href="/dashboard/case-management/error-analysis" icon={AlertTriangle} label="Hata Analizleri" />
      <NavItem href="/dashboard/case-practice" icon={Dumbbell} label="Vaka Pratiği" tierBadge="M2" />

      <SectionDivider />
      <NavItem href="/dashboard/community" icon={Users} label="Topluluk" />
      <NavItem href="/dashboard/store" icon={ShoppingBag} label="Mağaza" />
      <NavItem href="/dashboard/news" icon={Newspaper} label="Haberler" />

      {isAdmin ? (
        <>
          <SectionDivider />
          <NavItem href="/dashboard/admin/store" icon={ShieldCheck} label="Ürün Yönetimi" />
          <NavItem href="/dashboard/admin/news" icon={Newspaper} label="Haber Yönetimi" />
        </>
      ) : null}

      <SectionDivider />
      <NavItem href="/dashboard/support" icon={HelpCircle} label="Destek" />
      <NavItem href="/dashboard/how-to-use" icon={BookOpen} label="Nasıl Kullanılır" />
    </nav>
  )
}

function SectionDivider() {
  return <div className="w-6 h-px bg-white/[0.06] my-1.5" />
}
