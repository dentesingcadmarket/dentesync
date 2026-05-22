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

  // Use admin client to bypass the is_active filter
  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('store_products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/admin/store/products] fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ products: data ?? [] })
}

export async function POST(request: Request) {
  const { admin } = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 })
  }

  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Ürün adı zorunludur.' }, { status: 400 })
  }
  const price = Number(body.price)
  if (isNaN(price) || price <= 0) {
    return NextResponse.json({ error: 'Geçerli bir fiyat giriniz.' }, { status: 400 })
  }

  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('store_products')
    .insert({
      name: body.name.trim(),
      description: body.description?.trim() || null,
      price,
      category: body.category || null,
      stock: body.stock !== '' && body.stock != null ? Number(body.stock) : null,
      is_active: body.is_active ?? true,
      image_urls: body.image_urls ?? [],
      stripe_price_id: body.stripe_price_id?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/admin/store/products] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ product: data }, { status: 201 })
}
