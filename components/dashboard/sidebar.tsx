import Image from 'next/image'
import Link from 'next/link'
import { Settings, LogOut, ArrowUpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SidebarNav } from './sidebar-nav'
import { signOut } from '@/app/actions/auth'

const TIER_LABELS: Record<string, string> = {
  m1: 'M1 — Başlangıç',
  m2: 'M2 — Profesyonel',
  m3: 'M3 — B2B',
}

/**
 * Icon-only sidebar — iPhone dock vibe.
 * - 68px fixed width, all items 44x44, tooltips for labels.
 * - Aqua accent for active state and upgrade prompt.
 * - Single avatar circle for user (with tier shown as small chip).
 */
export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from('profiles')
    .select('full_name, avatar_url, subscription_tier, subscription_status, is_admin')
    .eq('id', user!.id)
    .maybeSingle()

  const p = profile as {
    full_name?: string
    avatar_url?: string
    subscription_tier?: string
    subscription_status?: string
    is_admin?: boolean
  } | null

  const tier = p?.subscription_tier ?? 'm1'
  const showUpgrade = tier === 'm1' || tier === 'm2'
  const displayName = p?.full_name ?? user?.email?.split('@')[0] ?? 'U'
  const initials = displayName.slice(0, 1).toUpperCase()

  return (
    <aside className="w-[68px] shrink-0 h-screen sticky top-0 flex flex-col items-center bg-nightfall-gray border-r border-outline-haze/[0.06] overflow-hidden">
      {/* Logo — icon only */}
      <Link
        href="/dashboard"
        title="DenteSync"
        className="flex items-center justify-center w-11 h-11 mt-3 rounded-cards hover:bg-white/[0.04] transition-colors"
      >
        <Image src="/logo.png" alt="DenteSync" width={28} height={28} className="rounded-md" />
      </Link>

      <div className="w-6 h-px bg-white/[0.06] my-3" />

      {/* Nav */}
      <SidebarNav isAdmin={p?.is_admin === true} />

      {/* Footer: upgrade + user avatar + settings + logout */}
      <div className="flex flex-col items-center gap-1 py-3 border-t border-outline-haze/[0.06] w-full">
        {showUpgrade ? (
          <Link
            href="/dashboard?upgrade=true&requiredTier=m2"
            title={tier === 'm1' ? "M2'ye Yükselt" : "M3'e Yükselt"}
            aria-label={tier === 'm1' ? "M2'ye Yükselt" : "M3'e Yükselt"}
            className="flex items-center justify-center w-11 h-11 rounded-cards bg-morphic-aqua/12 text-morphic-aqua hover:bg-morphic-aqua/20 transition-colors"
          >
            <ArrowUpCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </Link>
        ) : null}

        <Link
          href="/dashboard/settings"
          title="Ayarlar"
          aria-label="Ayarlar"
          className="flex items-center justify-center w-11 h-11 rounded-cards text-muted-silver hover:text-cloud-white hover:bg-white/[0.06] transition-colors"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            title="Çıkış"
            aria-label="Çıkış"
            className="flex items-center justify-center w-11 h-11 rounded-cards text-muted-silver hover:text-cloud-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        </form>

        {/* User avatar — bottom anchor */}
        <Link
          href="/dashboard/settings"
          title={`${displayName} · ${TIER_LABELS[tier] ?? tier}`}
          aria-label={`${displayName}, ${TIER_LABELS[tier] ?? tier}`}
          className="group relative mt-1 flex items-center justify-center w-9 h-9 rounded-full bg-charcoal-surface border border-outline-haze/[0.08] text-cloud-white text-body font-semibold hover:border-morphic-aqua/40 transition-colors"
        >
          {p?.avatar_url ? (
            <Image
              src={p.avatar_url}
              alt={displayName}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
          {/* Tiny tier indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 px-1 py-px rounded-full bg-morphic-aqua text-ebony-canvas text-[9px] leading-none font-bold tracking-tight border-2 border-nightfall-gray">
            {tier.toUpperCase()}
          </span>
        </Link>
      </div>
    </aside>
  )
}
