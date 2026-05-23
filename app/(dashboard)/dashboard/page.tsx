import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardHome } from '@/components/dashboard/dashboard-home'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminDb = createAdminClient()
  const [profileRes, casesRes, sessionsRes] = await Promise.all([
    adminDb.from('profiles').select('full_name, subscription_tier, created_at').eq('id', user!.id).maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('cases').select('id, status, created_at, title').eq('user_id', user!.id).order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('console_sessions').select('id, updated_at').eq('user_id', user!.id).order('updated_at', { ascending: false }).limit(5),
  ])

  const profile = profileRes.data as { full_name?: string; subscription_tier?: string; created_at?: string } | null
  const cases = (casesRes.data ?? []) as Array<{ id: string; status: string; created_at: string; title?: string }>
  const sessions = (sessionsRes.data ?? []) as Array<{ id: string; updated_at: string }>

  return (
    <DashboardHome
      name={profile?.full_name ?? null}
      tier={(profile?.subscription_tier ?? 'm1') as 'm1' | 'm2' | 'm3'}
      memberSince={profile?.created_at ?? null}
      cases={cases}
      recentSessions={sessions}
    />
  )
}
