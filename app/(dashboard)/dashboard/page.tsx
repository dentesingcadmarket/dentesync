import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, subscription_tier')
    .eq('id', user!.id)
    .maybeSingle()

  const name = (profile as { full_name?: string } | null)?.full_name

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-[#f4f4f5]">
        {name ? `Hoş geldin, ${name}` : 'Hoş geldin'}
      </h1>
      <p className="text-[#71717a] mt-1">DenteSync Dashboard — Faz 2&apos;de tam sidebar eklenecek.</p>
    </div>
  )
}
