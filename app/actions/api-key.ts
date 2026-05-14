'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Basit obfuscation — production'da vault/encryption kullanılmalı
function encode(key: string) {
  return Buffer.from(key).toString('base64')
}
function decode(encoded: string) {
  try { return Buffer.from(encoded, 'base64').toString('utf-8') } catch { return '' }
}

export async function saveApiKey(apiKey: string) {
  if (!apiKey.startsWith('sk-ant-')) {
    return { error: 'Geçersiz Anthropic API key. "sk-ant-" ile başlamalıdır.' }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ anthropic_api_key: encode(apiKey) })
    .eq('id', user.id)

  if (error) return { error: 'API key kaydedilemedi.' }
  revalidatePath('/dashboard/search/console')
  return { success: true }
}

export async function getApiKey(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('profiles')
    .select('anthropic_api_key')
    .eq('id', user.id)
    .maybeSingle()

  if (!data?.anthropic_api_key) return null
  return decode(data.anthropic_api_key)
}

export async function deleteApiKey() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('profiles')
    .update({ anthropic_api_key: null })
    .eq('id', user.id)

  revalidatePath('/dashboard/search/console')
  return { success: true }
}
