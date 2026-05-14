import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const TIER_PRICES: Record<string, string> = {
  m1: process.env.STRIPE_PRICE_M1 ?? '',
  m2: process.env.STRIPE_PRICE_M2 ?? '',
  m3: process.env.STRIPE_PRICE_M3 ?? '',
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    const body = await request.json()
    const { tier } = body as { tier: 'm1' | 'm2' | 'm3' }

    const priceId = TIER_PRICES[tier]
    if (!priceId) {
      return Response.json({ error: 'Geçersiz plan. Lütfen tekrar deneyin.' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    const { data: profile } = await db
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile?.stripe_customer_id || undefined,
      customer_email: profile?.stripe_customer_id ? undefined : user.email,
      success_url: `${siteUrl}/dashboard/settings?sub=success`,
      cancel_url: `${siteUrl}/dashboard/settings?sub=cancelled`,
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
      allow_promotion_codes: true,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
