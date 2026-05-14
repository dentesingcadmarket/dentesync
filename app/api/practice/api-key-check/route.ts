import { createClient } from '@/lib/supabase/server'

function decode(encoded: string) {
  try { return Buffer.from(encoded, 'base64').toString('utf-8') } catch { return '' }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ hasKey: false, apiKey: null }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: profile } = await db
      .from('profiles')
      .select('anthropic_api_key')
      .eq('id', user.id)
      .maybeSingle()

    const rawKey = profile?.anthropic_api_key ?? null
    if (!rawKey) return Response.json({ hasKey: false, apiKey: null })

    const decoded = decode(rawKey)
    return Response.json({ hasKey: true, apiKey: decoded })
  } catch {
    return Response.json({ hasKey: false, apiKey: null }, { status: 500 })
  }
}
