import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserPosts, getUserTopHashtags, getUserBadges } from '@/app/actions/community'
import { ProfilePageClient } from '@/components/dashboard/community/profile-page'
import type { CommunityPost, Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

export default async function MyProfilePage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (adminDb as any)
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, cover_url, posts_count, subscription_tier, created_at, specialty, experience_years, technical_score, solution_score, teaching_score')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) redirect('/dashboard/community')

  const [postsResult, topHashtags, badges] = await Promise.all([
    getUserPosts(profile.id, { page: 0 }),
    getUserTopHashtags(profile.id),
    getUserBadges(profile.id),
  ])

  const initialPosts = (postsResult.data ?? []) as PostWithProfile[]

  return (
    <ProfilePageClient
      profile={profile}
      initialPosts={initialPosts}
      isSelf={true}
      currentUserId={user.id}
      topHashtags={topHashtags}
      badges={badges}
    />
  )
}
