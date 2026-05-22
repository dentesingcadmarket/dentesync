export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SettingsWrapper } from '@/components/dashboard/settings/settings-wrapper'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminDb = createAdminClient()
  let { data: profile } = await adminDb
    .from('profiles')
    .select('full_name, avatar_url, username, subscription_tier, subscription_status, created_at')
    .eq('id', user!.id)
    .maybeSingle()

  // Profil yoksa trigger çalışmamış olabilir — otomatik oluştur
  if (!profile) {
    await adminDb
      .from('profiles')
      .upsert({ id: user!.id }, { onConflict: 'id', ignoreDuplicates: true })
    const { data: freshProfile } = await adminDb
      .from('profiles')
      .select('full_name, avatar_url, username, subscription_tier, subscription_status, created_at')
      .eq('id', user!.id)
      .maybeSingle()
    profile = freshProfile ?? { subscription_tier: 'm1', subscription_status: 'trial' }
  }

  return (
    <SettingsWrapper
      user={{ id: user!.id, email: user!.email ?? '' }}
      profile={profile}
      subParam={params.sub}
    />
  )
}
