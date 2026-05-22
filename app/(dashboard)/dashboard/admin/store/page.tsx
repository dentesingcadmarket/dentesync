export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductManager } from '@/components/dashboard/admin/product-manager'
import type { StoreProduct } from '@/lib/supabase/types'

export default async function AdminStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdminClient()
  const { data: profile } = await adminDb
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  const { data: products, error: productsError } = await adminDb
    .from('store_products')
    .select('*')
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('[AdminStorePage] products error:', productsError)
  }

  return (
    <ProductManager
      initialProducts={(products ?? []) as StoreProduct[]}
    />
  )
}
