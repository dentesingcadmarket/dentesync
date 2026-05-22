import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

async function verifyAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return { user: null, admin: false }

    const adminDb = createAdminClient()
    const { data: profile, error: profileError } = await adminDb
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) console.error('[verifyAdmin] profile error:', profileError)
    return { user, admin: profile?.is_admin === true }
  } catch (e) {
    console.error('[verifyAdmin] unexpected error:', e)
    return { user: null, admin: false }
  }
}

export async function GET() {
  const { admin } = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminDb as any)
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/admin/news] fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ news: data ?? [] })
}

export async function POST(request: Request) {
  const { user, admin } = await verifyAdmin()
  if (!admin || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Başlık zorunludur.' }, { status: 400 })
  }

  const isPublished = body.is_published === true

  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminDb as any)
    .from('news')
    .insert({
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() || null,
      content: body.content?.trim() || null,
      cover_image_url: body.cover_image_url || null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/admin/news] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ news: data }, { status: 201 })
}
