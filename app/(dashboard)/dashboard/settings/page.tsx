import { createClient } from '@/lib/supabase/server'
import { SettingsWrapper } from '@/components/dashboard/settings/settings-wrapper'
import { getApiKey } from '@/app/actions/api-key'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = await db
    .from('profiles')
    .select('full_name, username, avatar_url, subscription_tier, subscription_status, stripe_customer_id, created_at')
    .eq('id', user!.id)
    .maybeSingle()

  const apiKey = await getApiKey()

  return (
    <SettingsWrapper
      user={{ id: user!.id, email: user!.email ?? '' }}
      profile={profile}
      hasApiKey={!!apiKey}
      subParam={params.sub}
    />
  )
}
