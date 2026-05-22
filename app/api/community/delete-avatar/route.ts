import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const path = typeof body.path === 'string' ? body.path : ''
    if (!path) return Response.json({ error: 'Path eksik.' }, { status: 400 })
    if (!path.startsWith(`${user.id}/`)) {
      return Response.json({ error: 'Bu dosyayı silme yetkiniz yok.' }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).storage.from('avatars').remove([path])
    if (error) return Response.json({ error: error.message }, { status: 500 })

    return Response.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
