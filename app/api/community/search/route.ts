import { createClient } from '@/lib/supabase/server'
import { searchCommunity } from '@/app/actions/community'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const type = (searchParams.get('type') ?? 'all') as 'all' | 'posts' | 'users' | 'hashtags'
    const page = parseInt(searchParams.get('page') ?? '0')

    if (!q || q.length < 2) return Response.json({ posts: [], users: [], hashtags: [] })

    const result = await searchCommunity(q, type, page)
    return Response.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
