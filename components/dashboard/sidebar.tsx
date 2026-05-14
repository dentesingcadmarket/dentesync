import Image from 'next/image'
import Link from 'next/link'
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
  Settings,
  LogOut,
  ChevronUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NavItem } from './nav-item'
import { signOut } from '@/app/actions/auth'
import { Separator } from '@/components/ui/separator'

const TIER_LABELS: Record<string, string> = {
  m1: 'M1 — Başlangıç',
  m2: 'M2 — Profesyonel',
  m3: 'M3 — B2B',
}

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, subscription_tier, subscription_status')
    .eq('id', user!.id)
    .maybeSingle()

  const p = profile as {
    full_name?: string
    avatar_url?: string
    subscription_tier?: string
    subscription_status?: string
  } | null

  const tier = p?.subscription_tier ?? 'm1'
  const showUpgrade = tier === 'm1' || tier === 'm2'

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[#111114] border-r border-[rgba(255,255,255,0.07)] overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(255,255,255,0.07)]">
        <Image src="/logo.png" alt="DenteSync" width={32} height={32} className="rounded-lg shrink-0" />
        <span className="text-[#f4f4f5] font-semibold text-base leading-tight">DenteSync</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" exact />

        {/* Search grubu */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] text-[#71717a] uppercase tracking-widest px-3 mb-1">Arama</p>
        </div>
        <NavItem href="/dashboard/search/console" icon={Terminal} label="D-Console" />
        <NavItem href="/dashboard/search/plan" icon={Map} label="Planım" />

        {/* Vaka grubu */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] text-[#71717a] uppercase tracking-widest px-3 mb-1">Vakalar</p>
        </div>
        <NavItem href="/dashboard/case-management" icon={FolderOpen} label="Tüm Vakalar" />
        <NavItem href="/dashboard/case-management/error-analysis" icon={AlertTriangle} label="Hata Analizleri" />
        <NavItem href="/dashboard/case-practice" icon={Dumbbell} label="Vaka Pratiği" tierBadge="M2+" />

        {/* Platform grubu */}
        <div className="pt-3 pb-1">
          <p className="text-[10px] text-[#71717a] uppercase tracking-widest px-3 mb-1">Platform</p>
        </div>
        <NavItem href="/dashboard/community" icon={Users} label="Topluluk" tierBadge="M2+" />
        <NavItem href="/dashboard/store" icon={ShoppingBag} label="Mağaza" />
        <NavItem href="/dashboard/news" icon={Newspaper} label="Haberler" />

        <Separator className="my-3 bg-[rgba(255,255,255,0.07)]" />

        <NavItem href="/dashboard/support" icon={HelpCircle} label="Destek" />
        <NavItem href="/dashboard/how-to-use" icon={BookOpen} label="Nasıl Kullanılır" />
      </nav>

      {/* Alt kısım */}
      <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.07)] space-y-2">
        {/* Upgrade CTA */}
        {showUpgrade && (
          <Link
            href="/dashboard?upgrade=true&requiredTier=m2"
            className="block w-full text-center px-3 py-2 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#2563eb] text-xs font-medium hover:bg-[#2563eb]/20 transition-colors"
          >
            {tier === 'm1' ? 'M2\'ye Yükselt' : 'M3\'e Yükselt'}
          </Link>
        )}

        {/* Tier badge */}
        <div className="px-3 py-2 rounded-xl bg-[#1a1a1f] flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[#f4f4f5] text-xs font-medium truncate">
              {p?.full_name ?? user?.email?.split('@')[0] ?? 'Kullanıcı'}
            </p>
            <p className="text-[#71717a] text-[10px]">{TIER_LABELS[tier] ?? tier}</p>
          </div>
          <ChevronUp className="w-3 h-3 text-[#71717a] shrink-0" />
        </div>

        {/* Alt ikonlar */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/settings"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1a1a1f] text-xs transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Ayarlar</span>
          </Link>
          <form action={signOut} className="flex-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#71717a] hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
