'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface PlanStep {
  id: string
  user_id: string
  step_number: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  ai_generated: boolean
  parent_step_id: string | null
  created_at: string
}

export async function getPlanSteps(): Promise<PlanStep[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('plan_steps')
    .select('*')
    .eq('user_id', user.id)
    .order('step_number', { ascending: true })

  return data ?? []
}

export async function addPlanStep(title: string, description: string, stepNumber: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('plan_steps')
    .insert({
      user_id: user.id,
      step_number: stepNumber,
      title,
      description,
      status: 'pending',
      ai_generated: true,
    })

  if (error) return { error: 'Adım eklenemedi.' }
  revalidatePath('/dashboard/search/plan')
  return { success: true }
}

export async function updateStepStatus(id: string, status: 'pending' | 'in_progress' | 'completed') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('plan_steps')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Adım güncellenemedi.' }
  revalidatePath('/dashboard/search/plan')
  return { success: true }
}

export async function deletePlanStep(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('plan_steps')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Adım silinemedi.' }
  revalidatePath('/dashboard/search/plan')
  return { success: true }
}

export async function clearPlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('plan_steps')
    .delete()
    .eq('user_id', user.id)

  revalidatePath('/dashboard/search/plan')
  return { success: true }
}
