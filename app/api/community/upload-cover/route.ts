import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'Dosya bulunamadı.' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return Response.json({ error: 'Kapak fotoğrafı maksimum 5MB olabilir.' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowedMimes: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
    if (!ext || !allowedMimes[ext] || !file.type.startsWith('image/')) {
      return Response.json({ error: 'Geçersiz dosya formatı. JPG, PNG veya WebP kullanın.' }, { status: 400 })
    }

    const path = `${user.id}/${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from('covers')
      .upload(path, bytes, { contentType: allowedMimes[ext], upsert: true })

    if (uploadError) return Response.json({ error: `Kapak fotoğrafı yüklenemedi: ${uploadError.message}` }, { status: 500 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = (supabase as any).storage.from('covers').getPublicUrl(path)
    return Response.json({ url: data.publicUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
