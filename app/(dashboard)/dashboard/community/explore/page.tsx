import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTrendingHashtags, getPopularPosts } from '@/app/actions/community'
import { ExplorePageClient } from '@/components/dashboard/community/explore-page'
import type { CommunityPost, Profile, Hashtag } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

export default async function ExplorePage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  let trending: Hashtag[] = []
  let popularPosts: PostWithProfile[] = []

  try {
    const [trendingResult, popularResult] = await Promise.all([
      getTrendingHashtags(),
      getPopularPosts(0),
    ])
    trending = trendingResult
    popularPosts = (popularResult.data ?? []) as PostWithProfile[]
  } catch (err) {
    console.error('[ExplorePage] Veri yüklenemedi:', err)
  }

  return (
    <ExplorePageClient
      trendingHashtags={trending}
      popularPosts={popularPosts}
    />
  )
}
