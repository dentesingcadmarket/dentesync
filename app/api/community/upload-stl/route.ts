import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'community-posts'
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

const ALLOWED_EXTENSIONS = ['.stl', '.STL']

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
      return Response.json({ error: 'STL yükleme M2+ planında kullanılabilir.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      return Response.json({ error: 'Lütfen bir STL dosyası seçin.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'STL dosyası en fazla 50 MB olabilir.' }, { status: 400 })
    }

    const filename = file.name || 'model.stl'
    const hasValidExt = ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext))
    if (!hasValidExt) {
      return Response.json({ error: 'Yalnızca .stl dosyaları yüklenebilir.' }, { status: 400 })
    }

    const path = `${user.id}/models/${Date.now()}.stl`
    const bytes = new Uint8Array(await file.arrayBuffer())

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: 'model/stl', upsert: false })

    if (uploadError) {
      console.error('[upload-stl] Supabase storage hatası:', uploadError)
      if (uploadError.message?.toLowerCase().includes('bucket') ||
          uploadError.message?.toLowerCase().includes('not found')) {
        return Response.json(
          { error: 'Depolama alanı henüz yapılandırılmamış.' },
          { status: 500 }
        )
      }
      return Response.json({ error: `Yükleme başarısız: ${uploadError.message}` }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: urlData } = (supabase as any).storage.from(BUCKET).getPublicUrl(path)
    return Response.json({ url: urlData.publicUrl, filename })

  } catch (err) {
    console.error('[upload-stl] Beklenmeyen hata:', err)
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return Response.json({ error: `Sunucu hatası: ${msg}` }, { status: 500 })
  }
}
