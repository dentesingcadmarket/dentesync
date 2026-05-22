import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Oturum yok' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase as any)
    .from('profiles')
    .select('id, subscription_tier, subscription_status, username, full_name')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({ userId: user.id, profile, error })
}
