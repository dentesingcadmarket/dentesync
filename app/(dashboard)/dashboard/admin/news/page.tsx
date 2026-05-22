export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NewsManager } from '@/components/dashboard/admin/news-manager'
import type { NewsItem } from '@/components/dashboard/admin/news-manager'

export default async function AdminNewsPage() {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: news, error } = await (adminDb as any)
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[AdminNewsPage] news error:', error)
  }

  return (
    <NewsManager
      initialNews={(news ?? []) as NewsItem[]}
    />
  )
}
