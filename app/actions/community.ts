'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDB() { return (await createClient()) as any }

export async function getPosts(page = 0, limit = 20) {
  const db = await getDB()
  const from = page * limit
  const { data, error } = await db
    .from('community_posts')
    .select('*, profiles(username, full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)
  if (error) return { error: 'Gönderiler yüklenemedi.' }
  return { data }
}

export async function createPost(content: string, imageUrl?: string) {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { data: profile } = await db
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['m2', 'm3'].includes(profile.subscription_tier)) {
    return { error: 'Bu özellik M2+ planında mevcut.' }
  }

  if (!content.trim()) return { error: 'İçerik boş olamaz.' }
  if (content.length > 1000) return { error: 'Gönderi en fazla 1000 karakter olabilir.' }

  const { data, error } = await db
    .from('community_posts')
    .insert({ user_id: user.id, content: content.trim(), image_url: imageUrl ?? null })
    .select('*, profiles(username, full_name, avatar_url)')
    .single()

  if (error) return { error: 'Gönderi oluşturulamadı.' }
  revalidatePath('/dashboard/community')
  return { data }
}

export async function deletePost(postId: string) {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { error } = await db
    .from('community_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) return { error: 'Gönderi silinemedi.' }
  revalidatePath('/dashboard/community')
  return { success: true }
}

export async function toggleLike(postId: string) {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { data: post } = await db
    .from('community_posts')
    .select('likes')
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Gönderi bulunamadı.' }

  const { error } = await db
    .from('community_posts')
    .update({ likes: (post.likes ?? 0) + 1 })
    .eq('id', postId)

  if (error) return { error: 'Beğeni kaydedilemedi.' }
  return { success: true }
}

export async function getComments(postId: string) {
  const db = await getDB()
  const { data, error } = await db
    .from('community_comments')
    .select('*, profiles(username, full_name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) return { error: 'Yorumlar yüklenemedi.' }
  return { data }
}

export async function createComment(postId: string, content: string) {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { data: profile } = await db
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['m2', 'm3'].includes(profile.subscription_tier)) {
    return { error: 'Yorum yazmak için M2+ planı gerekiyor.' }
  }

  if (!content.trim()) return { error: 'Yorum boş olamaz.' }

  const { data, error } = await db
    .from('community_comments')
    .insert({ post_id: postId, user_id: user.id, content: content.trim() })
    .select('*, profiles(username, full_name, avatar_url)')
    .single()

  if (error) return { error: 'Yorum gönderilemedi.' }
  return { data }
}

export async function uploadCommunityImage(file: File) {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  if (file.size > 5 * 1024 * 1024) return { error: 'Görsel maksimum 5MB olabilir.' }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext ?? '')) {
    return { error: 'Sadece JPG, PNG, GIF, WEBP formatları kabul edilir.' }
  }

  const path = `community/${user.id}/${Date.now()}.${ext}`
  const { error: uploadError } = await db.storage.from('community-images').upload(path, file)
  if (uploadError) return { error: 'Görsel yüklenemedi.' }

  const { data } = db.storage.from('community-images').getPublicUrl(path)
  return { url: data.publicUrl }
}
