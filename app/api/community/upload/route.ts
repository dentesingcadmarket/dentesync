import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: profile } = await db
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || !['m2', 'm3'].includes(profile.subscription_tier)) {
      return Response.json({ error: 'Bu özellik M2+ planında mevcut.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Dosya bulunamadı.' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'Görsel maksimum 5MB olabilir.' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) {
      return Response.json({ error: 'Geçersiz dosya formatı.' }, { status: 400 })
    }

    const path = `community/${user.id}/${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await db.storage
      .from('community-images')
      .upload(path, bytes, { contentType: file.type })

    if (uploadError) return Response.json({ error: 'Görsel yüklenemedi.' }, { status: 500 })

    const { data } = db.storage.from('community-images').getPublicUrl(path)
    return Response.json({ url: data.publicUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
