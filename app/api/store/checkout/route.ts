import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const body = await request.json()
    const { items } = body as {
      items: Array<{ productId: string; quantity: number }>
    }

    if (!items?.length) return Response.json({ error: 'Sepet boş.' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const productIds = items.map(i => i.productId)
    const { data: products } = await db
      .from('store_products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)

    if (!products?.length) return Response.json({ error: 'Ürünler bulunamadı.' }, { status: 404 })

    const lineItems = items.map((item) => {
      const product = products.find((p: { id: string }) => p.id === item.productId)
      if (!product) throw new Error(`Ürün bulunamadı: ${item.productId}`)
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: product.name, description: product.description ?? undefined },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      }
    })

    const { data: profile } = await db
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .maybeSingle()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : user.email,
      success_url: `${siteUrl}/dashboard/store?success=1`,
      cancel_url: `${siteUrl}/dashboard/store?cancelled=1`,
      metadata: { user_id: user.id },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
