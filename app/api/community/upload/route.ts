import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'community-posts'
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })
    }

    const adminDb = createAdminClient()
    const { data: profile, error: profileError } = await adminDb
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return Response.json({ error: 'Profil bilgisi alınamadı.' }, { status: 500 })
    }
    if (!profile || !['m2', 'm3'].includes(profile.subscription_tier)) {
      return Response.json({ error: 'Görsel yükleme M2+ planında kullanılabilir.' }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll('file') as File[]

    if (!files.length || (files.length === 1 && files[0].size === 0)) {
      return Response.json({ error: 'Lütfen en az bir dosya seçin.' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return Response.json({ error: `"${file.name}" boyutu en fazla 5 MB olabilir.` }, { status: 400 })
      }

      const mimeType = file.type.toLowerCase()
      const ext = ALLOWED_MIME[mimeType]
      if (!ext) {
        return Response.json(
          { error: 'Desteklenmeyen dosya formatı. Lütfen JPG, PNG, WebP veya GIF yükleyin.' },
          { status: 400 }
        )
      }

      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const bytes = new Uint8Array(await file.arrayBuffer())

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: uploadError } = await (supabase as any).storage
        .from(BUCKET)
        .upload(path, bytes, { contentType: mimeType, upsert: false })

      if (uploadError) {
        console.error('[community/upload] Supabase storage hatası:', uploadError)
        if (uploadError.message?.toLowerCase().includes('bucket') ||
            uploadError.message?.toLowerCase().includes('not found')) {
          return Response.json(
            { error: 'Depolama alanı henüz yapılandırılmamış. Lütfen yöneticinize bildirin.' },
            { status: 500 }
          )
        }
        return Response.json(
          { error: `Görsel yüklenemedi: ${uploadError.message}` },
          { status: 500 }
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: urlData } = (supabase as any).storage.from(BUCKET).getPublicUrl(path)
      urls.push(urlData.publicUrl)
    }

    return Response.json({ urls, url: urls[0] })

  } catch (err) {
    console.error('[community/upload] Beklenmeyen hata:', err)
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return Response.json({ error: `Sunucu hatası: ${msg}` }, { status: 500 })
  }
}
