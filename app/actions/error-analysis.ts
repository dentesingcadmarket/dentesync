'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getCasesForSelect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('cases')
    .select('id, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []) as { id: string; title: string }[]
}

export async function saveErrorAnalysis(
  errorDescription: string,
  aiAnalysis: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  roadmapImpact: string,
  caseId?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('error_analyses')
    .insert({
      user_id: user.id,
      case_id: caseId ?? null,
      error_description: errorDescription,
      ai_analysis: aiAnalysis,
      severity,
      roadmap_impact: roadmapImpact,
    })

  if (error) return { error: 'Analiz kaydedilemedi.' }
  revalidatePath('/dashboard/case-management/error-analysis')
  if (caseId) revalidatePath(`/dashboard/case-management/${caseId}`)
  return { success: true }
}

export async function deleteErrorAnalysis(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('error_analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Analiz silinemedi.' }
  revalidatePath('/dashboard/case-management/error-analysis')
  return { success: true }
}
