import { createClient } from '@/lib/supabase/server'
import { getNotifications, markNotificationsRead, getUnreadNotificationCount } from '@/app/actions/community'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '0')
    const countOnly = searchParams.get('count') === 'true'

    if (countOnly) {
      const count = await getUnreadNotificationCount()
      return Response.json({ count })
    }

    const result = await getNotifications(page)
    if ('error' in result) return Response.json({ error: result.error }, { status: 500 })
    return Response.json({ data: result.data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const result = await markNotificationsRead()
    if ('error' in result) return Response.json({ error: result.error }, { status: 500 })
    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
