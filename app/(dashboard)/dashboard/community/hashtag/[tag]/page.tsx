import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getHashtagFeed, getLikedPostIds, getSavedPostIds } from '@/app/actions/community'
import { HashtagPageClient } from '@/components/dashboard/community/hashtag-page'
import type { CommunityPost, Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

export default async function HashtagFeedPage({ params }: { params: { tag: string } }) {
  const { tag } = params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (adminDb as any)
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle()

  const canWrite = profile ? ['m2', 'm3'].includes(profile.subscription_tier) : false

  const feedResult = await getHashtagFeed(tag.toLowerCase(), 0)
  const initialPosts = (feedResult.data ?? []) as PostWithProfile[]
  const totalCount = feedResult.totalCount ?? 0

  const postIds = initialPosts.map(p => p.id)
  const [likedIds, savedIds] = await Promise.all([
    getLikedPostIds(postIds),
    getSavedPostIds(postIds),
  ])

  return (
    <HashtagPageClient
      tag={tag.toLowerCase()}
      totalCount={totalCount}
      initialPosts={initialPosts}
      currentUserId={user.id}
      canWrite={canWrite}
      initialLikedIds={likedIds}
      initialSavedIds={savedIds}
    />
  )
}
