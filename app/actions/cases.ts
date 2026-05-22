'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createTypedClient } from '@/lib/supabase/server'
import type { CaseStatus } from '@/lib/supabase/types'

// Supabase client without strict generics for mutations
async function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await createTypedClient()) as any
}

export interface CaseAttachment {
  name: string
  path: string
  type: string
  size: number
  uploadedAt: string
}

export async function createCase(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const status = (formData.get('status') as CaseStatus) ?? 'open'
  const notes = formData.get('notes') as string | null
  const tagsRaw = formData.get('tags') as string | null
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  if (!title?.trim()) return { error: 'Başlık zorunludur.' }

  const { data, error } = await supabase
    .from('cases')
    .insert({ user_id: user.id, title: title.trim(), description, status, notes, tags })
    .select()
    .single()

  if (error) return { error: 'Vaka oluşturulamadı. Lütfen tekrar deneyin.' }

  revalidatePath('/dashboard/case-management')
  return { data }
}

export async function updateCase(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const status = formData.get('status') as CaseStatus
  const notes = formData.get('notes') as string | null
  const tagsRaw = formData.get('tags') as string | null
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []

  if (!title?.trim()) return { error: 'Başlık zorunludur.' }

  const { data, error } = await supabase
    .from('cases')
    .update({ title: title.trim(), description, status, notes, tags, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: 'Vaka güncellenemedi. Lütfen tekrar deneyin.' }

  revalidatePath('/dashboard/case-management')
  revalidatePath(`/dashboard/case-management/${id}`)
  return { data }
}

export async function updateCaseStatus(id: string, status: CaseStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { error } = await supabase
    .from('cases')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Durum güncellenemedi.' }

  revalidatePath(`/dashboard/case-management/${id}`)
  revalidatePath('/dashboard/case-management')
  return { success: true }
}

export async function deleteCase(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  // Önce dosyaları Storage'dan sil
  const { data: caseData } = await supabase
    .from('cases')
    .select('attachments')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  const attachments = (caseData?.attachments ?? []) as CaseAttachment[]
  if (attachments.length > 0) {
    const paths = attachments.map(a => a.path)
    await supabase.storage.from('case-files').remove(paths)
  }

  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Vaka silinemedi. Lütfen tekrar deneyin.' }

  revalidatePath('/dashboard/case-management')
  return { success: true }
}

export async function uploadCaseFile(caseId: string, file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isSTL = ext === 'stl'
  const maxSize = isSTL ? 50 * 1024 * 1024 : 5 * 1024 * 1024

  if (file.size > maxSize) {
    return { error: isSTL ? 'STL dosyası maksimum 50MB olabilir.' : 'Dosya maksimum 5MB olabilir.' }
  }

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const filePath = `${user.id}/${caseId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('case-files')
    .upload(filePath, file, { upsert: false })

  if (uploadError) return { error: 'Dosya yüklenemedi. Lütfen tekrar deneyin.' }

  // Mevcut attachments'a ekle
  const { data: caseData } = await supabase
    .from('cases')
    .select('attachments, stl_file_url')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .maybeSingle()

  const existing = (caseData?.attachments ?? []) as CaseAttachment[]
  const newAttachment: CaseAttachment = {
    name: file.name,
    path: filePath,
    type: file.type || ext,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }

  const updateData: Record<string, unknown> = {
    attachments: [...existing, newAttachment],
    updated_at: new Date().toISOString(),
  }

  if (isSTL) updateData.stl_file_url = filePath

  const { error: updateError } = await supabase
    .from('cases')
    .update(updateData)
    .eq('id', caseId)
    .eq('user_id', user.id)

  if (updateError) return { error: 'Dosya kaydedilemedi.' }

  revalidatePath(`/dashboard/case-management/${caseId}`)
  return { success: true, attachment: newAttachment }
}

export async function deleteCaseFile(caseId: string, filePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  await supabase.storage.from('case-files').remove([filePath])

  const { data: caseData } = await supabase
    .from('cases')
    .select('attachments, stl_file_url')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .maybeSingle()

  const existing = (caseData?.attachments ?? []) as CaseAttachment[]
  const updated = existing.filter(a => a.path !== filePath)

  const updateData: Record<string, unknown> = {
    attachments: updated,
    updated_at: new Date().toISOString(),
  }
  if (caseData?.stl_file_url === filePath) updateData.stl_file_url = null

  const { error: updErr } = await supabase
    .from('cases')
    .update(updateData)
    .eq('id', caseId)
    .eq('user_id', user.id)

  if (updErr) {
    console.error('[deleteCaseFile] update failed', updErr)
    return { error: 'Dosya silindi ama vaka güncellenemedi.' }
  }

  revalidatePath(`/dashboard/case-management/${caseId}`)
  return { success: true }
}

export async function getSignedUrl(filePath: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('case-files')
    .createSignedUrl(filePath, 3600)

  if (error) return { error: 'İndirme linki oluşturulamadı.' }
  return { url: data.signedUrl }
}
