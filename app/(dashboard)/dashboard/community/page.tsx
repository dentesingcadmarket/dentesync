import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/app/actions/community'
import { CommunityWrapper } from '@/components/dashboard/community/community-wrapper'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile } = await db
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user!.id)
    .maybeSingle()

  const canWrite = profile && ['m2', 'm3'].includes(profile.subscription_tier)
  const result = await getPosts(0)
  const initialPosts = result.data ?? []

  return (
    <CommunityWrapper
      canWrite={!!canWrite}
      currentUserId={user!.id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialPosts={initialPosts as any}
    />
  )
}
