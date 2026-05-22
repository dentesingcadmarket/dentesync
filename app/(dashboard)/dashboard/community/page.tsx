import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPosts, getLikedPostIds, getSavedPostIds, getUnreadNotificationCount, getSidebarData } from '@/app/actions/community'
import { CommunityWrapper } from '@/components/dashboard/community/community-wrapper'
import { RightSidebar } from '@/components/dashboard/community/right-sidebar'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (adminDb as any)
    .from('profiles')
    .select('subscription_tier, username, full_name, avatar_url, specialty, experience_years')
    .eq('id', user.id)
    .maybeSingle()

  const canWrite = profile && ['m2', 'm3'].includes(profile.subscription_tier)

  const [postsResult, sidebarData] = await Promise.all([
    getPosts({ page: 0 }),
    getSidebarData(),
  ])

  if ('error' in postsResult && postsResult.error) {
    console.error('[CommunityPage] getPosts başarısız:', postsResult.error)
  }

  const initialPosts = (postsResult.data ?? []) as Parameters<typeof CommunityWrapper>[0]['initialPosts']
  const postIds = initialPosts.map((p) => p.id)

  const [initialLikedIds, initialSavedIds, initialUnreadCount] = await Promise.all([
    getLikedPostIds(postIds),
    getSavedPostIds(postIds),
    getUnreadNotificationCount(),
  ])

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 overflow-auto">
        <CommunityWrapper
          canWrite={!!canWrite}
          currentUserId={user.id}
          currentUsername={profile?.username ?? ''}
          initialPosts={initialPosts}
          initialLikedIds={initialLikedIds}
          initialSavedIds={initialSavedIds}
          initialUnreadCount={initialUnreadCount}
        />
      </div>
      <div className="hidden xl:block w-[280px] shrink-0 border-l border-[rgba(229,231,235,0.08)] overflow-y-auto">
        <RightSidebar sidebarData={sidebarData} />
      </div>
    </div>
  )
}
