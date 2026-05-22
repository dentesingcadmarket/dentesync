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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { admin } = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Başlık zorunludur.' }, { status: 400 })
  }

  const isPublished = body.is_published === true

  const adminDb = createAdminClient()

  // If toggling to published, set published_at only if not already set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (adminDb as any)
    .from('news')
    .select('published_at')
    .eq('id', params.id)
    .maybeSingle()

  const publishedAt = isPublished
    ? (existing.data?.published_at ?? new Date().toISOString())
    : null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (adminDb as any)
    .from('news')
    .update({
      title: body.title.trim(),
      excerpt: body.excerpt?.trim() || null,
      content: body.content?.trim() || null,
      cover_image_url: body.cover_image_url || null,
      is_published: isPublished,
      published_at: publishedAt,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('[PUT /api/admin/news/[id]] update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ news: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { admin } = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminDb as any)
    .from('news')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('[DELETE /api/admin/news/[id]] delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
