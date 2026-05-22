import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername, getUserPosts, getUserTopHashtags, getUserBadges } from '@/app/actions/community'
import { ProfilePageClient } from '@/components/dashboard/community/profile-page'
import type { CommunityPost, Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const profileResult = await getProfileByUsername(username)
  if ('error' in profileResult || !profileResult.data) {
    redirect('/dashboard/community')
  }

  const profile = profileResult.data
  const isSelf = profile.id === user.id

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
      isSelf={isSelf}
      currentUserId={user.id}
      topHashtags={topHashtags}
      badges={badges}
    />
  )
}
