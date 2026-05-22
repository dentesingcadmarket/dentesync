export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

function getDB() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adminClient as any
}

function getTierFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id ?? ''
  if (!priceId) return 'm1'
  const map: Record<string, string> = {}
  if (process.env.STRIPE_PRICE_M1) map[process.env.STRIPE_PRICE_M1] = 'm1'
  if (process.env.STRIPE_PRICE_M2) map[process.env.STRIPE_PRICE_M2] = 'm2'
  if (process.env.STRIPE_PRICE_M3) map[process.env.STRIPE_PRICE_M3] = 'm3'
  return map[priceId] ?? 'm1'
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const db = getDB()

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return new Response('Webhook signature missing', { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed'
    return new Response(msg, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.user_id
        if (!userId) break

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const tier = getTierFromSubscription(subscription)

        await db.from('profiles').update({
          subscription_tier: tier,
          subscription_status: 'active',
          stripe_customer_id: session.customer as string,
        }).eq('id', userId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile) break

        const tier = getTierFromSubscription(subscription)
        const status = subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status === 'canceled' || subscription.status === 'unpaid'
            ? 'inactive'
            : 'active'

        await db.from('profiles').update({
          subscription_tier: tier,
          subscription_status: status,
        }).eq('id', profile.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!profile) break

        await db.from('profiles').update({
          subscription_tier: 'm1',
          subscription_status: 'inactive',
        }).eq('id', profile.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (profile) {
          await db.from('profiles').update({
            subscription_status: 'inactive',
          }).eq('id', profile.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (profile) {
          await db.from('profiles').update({
            subscription_status: 'active',
          }).eq('id', profile.id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook handler error'
    console.error('[Stripe Webhook]', msg)
    return new Response(msg, { status: 500 })
  }
}
