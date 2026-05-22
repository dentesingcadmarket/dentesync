import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function buildPriceTier(): Record<string, string> {
  const map: Record<string, string> = {}
  if (process.env.STRIPE_PRICE_M1) map[process.env.STRIPE_PRICE_M1] = 'm1'
  if (process.env.STRIPE_PRICE_M2) map[process.env.STRIPE_PRICE_M2] = 'm2'
  if (process.env.STRIPE_PRICE_M3) map[process.env.STRIPE_PRICE_M3] = 'm3'
  return map
}

function tierFromPriceId(priceId: string): string {
  if (!priceId) return 'm1'
  return buildPriceTier()[priceId] ?? 'm1'
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adb = createAdminClient() as any
    const { data: profile } = await adb
      .from('profiles')
      .select('stripe_customer_id, subscription_tier, subscription_status')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.stripe_customer_id) {
      return Response.json({
        tier: profile?.subscription_tier ?? 'm1',
        status: profile?.subscription_status ?? 'trial',
        message: 'Stripe bağlantısı yok — mevcut plan gösteriliyor.',
      })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 5,
      expand: ['data.items.data.price'],
    })

    const active = subscriptions.data.find(s =>
      s.status === 'active' || s.status === 'trialing'
    )

    if (!active) {
      // Aktif abonelik yok — en son iptal edilmiş aboneliği kontrol et
      const cancelled = subscriptions.data.find(s => s.status === 'canceled')
      const newStatus = cancelled ? 'inactive' : 'inactive'
      const newTier = cancelled
        ? tierFromPriceId(cancelled.items.data[0]?.price.id ?? '')
        : 'm1'

      await adb.from('profiles').update({
        subscription_tier: newTier === 'm1' ? 'm1' : newTier,
        subscription_status: newStatus,
      }).eq('id', user.id)

      return Response.json({
        tier: newTier,
        status: newStatus,
        message: 'Aktif abonelik bulunamadı.',
      })
    }

    const tier = tierFromPriceId(active.items.data[0]?.price.id ?? '')
    const status = active.status === 'trialing' ? 'active' : 'active'

    await adb.from('profiles').update({
      subscription_tier: tier,
      subscription_status: status,
    }).eq('id', user.id)

    return Response.json({ tier, status, message: 'Abonelik senkronize edildi.' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
