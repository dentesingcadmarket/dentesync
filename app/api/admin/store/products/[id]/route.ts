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
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin } = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Ürün adı zorunludur.' }, { status: 400 })
  }

  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('store_products')
    .update({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      price: Number(body.price),
      category: body.category || null,
      stock: body.stock !== '' && body.stock != null ? Number(body.stock) : null,
      is_active: body.is_active,
      image_urls: body.image_urls ?? [],
      stripe_price_id: body.stripe_price_id?.trim() || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PUT /api/admin/store/products/:id] update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ product: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin } = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const { id } = await params
  const adminDb = createAdminClient()

  // Fetch image_urls before delete (admin client to ensure we can read inactive products too)
  const { data: product } = await adminDb
    .from('store_products')
    .select('image_urls')
    .eq('id', id)
    .maybeSingle()

  const { error } = await adminDb
    .from('store_products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[DELETE /api/admin/store/products/:id] delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Clean up storage objects (best-effort)
  if (product?.image_urls?.length) {
    const paths = (product.image_urls as string[])
      .map((url: string) => {
        const match = url.match(/store-images\/(.+)$/)
        return match ? match[1] : null
      })
      .filter(Boolean) as string[]

    if (paths.length) {
      await adminDb.storage.from('store-images').remove(paths)
    }
  }

  return NextResponse.json({ success: true })
}
