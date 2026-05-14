import { createClient } from '@/lib/supabase/server'
import { StoreWrapper } from '@/components/dashboard/store/store-wrapper'

export default async function StorePage({ searchParams }: { searchParams: Promise<{ success?: string; cancelled?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: products } = await db
    .from('store_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (params.cancelled) {
    // just show the page normally
  }

  return (
    <StoreWrapper
      products={products ?? []}
      successParam={params.success === '1'}
    />
  )
}
