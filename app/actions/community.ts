'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Hashtag, Notification, PostType, UserBadge, ActiveMember } from '@/lib/supabase/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getDB() { return (await createClient()) as any }

const POST_SELECT = '*, profiles!community_posts_user_id_fkey(username, full_name, avatar_url, subscription_tier, posts_count)'

// ── Rozet yardımcısı (private) ────────────────────────────────

async function checkAndAwardBadges(userId: string): Promise<void> {
  try {
    const adminDb = createAdminClient()

    const { data: profile } = await adminDb
      .from('profiles')
      .select('posts_count')
      .eq('id', userId)
      .single()

    const awards: { badge_key: string; badge_label: string }[] = []

    if ((profile?.posts_count ?? 0) >= 1) awards.push({ badge_key: 'ilk_adim', badge_label: 'İlk Adım' })
    if ((profile?.posts_count ?? 0) >= 10) awards.push({ badge_key: 'aktif_uye', badge_label: 'Aktif Üye' })

    const { count: bestAnswerCount } = await adminDb
      .from('community_comments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_best_answer', true)
    if ((bestAnswerCount ?? 0) >= 10) awards.push({ badge_key: 'cozum_uretici', badge_label: 'Çözüm Üretici' })

    const { count: totalComments } = await adminDb
      .from('community_comments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if ((totalComments ?? 0) >= 5) {
      const { count: helpfulComments } = await adminDb
        .from('community_comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('helpful_count', 0)
      if ((helpfulComments ?? 0) / (totalComments ?? 1) >= 0.7) {
        awards.push({ badge_key: 'guvenilir_kaynak', badge_label: 'Güvenilir Kaynak' })
      }
    }

    const { data: zirkon } = await adminDb
      .from('hashtags')
      .select('id')
      .eq('name', 'zirkonyum')
      .maybeSingle()
    if (zirkon) {
      const { data: zirkonPosts } = await adminDb
        .from('post_hashtags')
        .select('post_id, community_posts!inner(user_id)')
        .eq('hashtag_id', zirkon.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('community_posts.user_id' as any, userId)
      if ((zirkonPosts?.length ?? 0) >= 20) awards.push({ badge_key: 'zirkonyum_uzmani', badge_label: 'Zirkonyum Uzmanı' })
    }

    const { data: implant } = await adminDb
      .from('hashtags')
      .select('id')
      .eq('name', 'implant')
      .maybeSingle()
    if (implant) {
      const { data: implantPosts } = await adminDb
        .from('post_hashtags')
        .select('post_id, community_posts!inner(user_id)')
        .eq('hashtag_id', implant.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('community_posts.user_id' as any, userId)
      if ((implantPosts?.length ?? 0) >= 20) awards.push({ badge_key: 'implant_uzmani', badge_label: 'İmplant Uzmanı' })
    }

    const { count: errorCount } = await adminDb
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('post_type', 'error_solution')
    if ((errorCount ?? 0) >= 10) awards.push({ badge_key: 'hata_avcisi', badge_label: 'Hata Avcısı' })

    const { count: stepsCount } = await adminDb
      .from('community_posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('post_type', 'step_by_step')
    if ((stepsCount ?? 0) >= 5) awards.push({ badge_key: 'surec_ustasi', badge_label: 'Süreç Ustası' })

    for (const badge of awards) {
      await adminDb.from('user_badges').upsert(
        { user_id: userId, ...badge },
        { onConflict: 'user_id,badge_key', ignoreDuplicates: true }
      )
    }
  } catch (err) {
    console.error('[checkAndAwardBadges] hata:', err)
  }
}

// ── Post işlemleri ────────────────────────────────────────────

export async function getPosts(params?: {
  page?: number
  post_type?: PostType
  hashtag?: string
  limit?: number
}) {
  const { page = 0, limit = 20, post_type, hashtag } = params ?? {}
  const adminDb = createAdminClient()
  const from = page * limit

  try {
    if (hashtag) {
      const { data: htag } = await adminDb
        .from('hashtags')
        .select('id')
        .eq('name', hashtag.toLowerCase())
        .maybeSingle()

      if (!htag) return { data: [] }

      const { data: phRows } = await adminDb
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', htag.id)

      if (!phRows?.length) return { data: [] }

      const postIds = phRows.map((r: { post_id: string }) => r.post_id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = adminDb
        .from('community_posts')
        .select(POST_SELECT)
        .in('id', postIds)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (post_type) q = (q as any).eq('post_type', post_type)

      const { data, error } = await q
      if (error) return { error: 'Gönderiler yüklenemedi.' }
      return { data }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = adminDb
      .from('community_posts')
      .select(POST_SELECT)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (post_type) q = q.eq('post_type', post_type)

    const { data, error } = await q
    if (error) return { error: 'Gönderiler yüklenemedi.' }
    return { data }
  } catch (err) {
    console.error('[getPosts] hata:', err)
    return { error: 'Gönderiler yüklenemedi.' }
  }
}

export async function getHashtagFeed(tagName: string, page = 0, limit = 20) {
  const adminDb = createAdminClient()
  const from = page * limit

  const { data: hashtag } = await adminDb
    .from('hashtags')
    .select('id, post_count')
    .eq('name', tagName.toLowerCase())
    .maybeSingle()

  if (!hashtag) return { data: [], totalCount: 0 }

  const { data } = await adminDb
    .from('post_hashtags')
    .select('post_id')
    .eq('hashtag_id', hashtag.id)

  if (!data?.length) return { data: [], totalCount: 0 }

  const postIds = data.map((r: { post_id: string }) => r.post_id)

  const { data: posts, error: postsError } = await adminDb
    .from('community_posts')
    .select(POST_SELECT)
    .in('id', postIds)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (postsError) return { error: 'Gönderi akışı yüklenemedi.' }
  return { data: posts ?? [], totalCount: hashtag.post_count }
}

export async function createPost(params: {
  post_type: PostType
  title?: string
  content?: string
  image_url?: string
  metadata?: Record<string, unknown>
  hashtag_ids?: string[]
}) {
  const { post_type, title, content, image_url, metadata, hashtag_ids } = params
  const db = await getDB()
  const adminDb = createAdminClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { data: profile, error: profileError } = await adminDb
    .from('profiles')
    .select('subscription_tier, username, full_name, avatar_url, posts_count')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) return { error: `Profil sorgu hatası: ${profileError.message}` }
  if (!profile) return { error: 'Profil bulunamadı. Lütfen tekrar giriş yapın.' }
  if (!['m2', 'm3'].includes(profile.subscription_tier)) {
    return { error: `Bu özellik M2+ planında mevcut. Mevcut planınız: ${profile.subscription_tier || 'tanımsız'}` }
  }

  if (!post_type) return { error: 'İçerik tipi seçmelisiniz.' }

  // Tip bazlı validasyon
  if (['consultation', 'showcase', 'critique_request'].includes(post_type) && !image_url) {
    return { error: 'Bu içerik tipi için görsel zorunludur.' }
  }
  if (post_type === 'step_by_step') {
    const steps = (metadata?.steps as unknown[]) ?? []
    if (steps.length < 2) return { error: 'Step-by-step için en az 2 adım gereklidir.' }
  }
  if (post_type === 'material_review' && !title) {
    return { error: 'Materyal adı zorunludur.' }
  }

  const contentText = content?.trim() || null
  if (contentText && contentText.length > 3000) return { error: 'İçerik en fazla 3000 karakter olabilir.' }

  const { data: inserted, error: insertError } = await db
    .from('community_posts')
    .insert({
      user_id: user.id,
      post_type,
      title: title?.trim() ?? null,
      content: contentText,
      image_url: image_url ?? null,
      metadata: metadata ?? null,
    })
    .select('id, user_id, content, image_url, likes, created_at, post_type, title, metadata')
    .single()

  if (insertError || !inserted) {
    console.error('[createPost] INSERT başarısız:', insertError)
    return { error: `Gönderi oluşturulamadı: ${insertError?.message ?? 'bilinmeyen hata'}` }
  }

  // Hashtag ilişkilendirme
  if (hashtag_ids?.length) {
    for (const hid of hashtag_ids) {
      await adminDb.from('post_hashtags').upsert(
        { post_id: inserted.id, hashtag_id: hid },
        { onConflict: 'post_id,hashtag_id', ignoreDuplicates: true }
      )
    }
  }

  revalidatePath('/dashboard/community')
  await checkAndAwardBadges(user.id)

  return {
    data: {
      ...inserted,
      comment_count: 0,
      profiles: {
        username: profile.username ?? null,
        full_name: profile.full_name ?? null,
        avatar_url: profile.avatar_url ?? null,
        subscription_tier: profile.subscription_tier,
        posts_count: profile.posts_count ?? 0,
      },
    },
  }
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
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function toggleLike(postId: string): Promise<{ liked?: boolean; likes?: number; error?: string }> {
  const db = await getDB()
  const adminDb = createAdminClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { error: rpcError, data } = await db.rpc('toggle_post_like', { p_post_id: postId })
  if (rpcError) return { error: 'Beğeni işlemi başarısız.' }
  const result = data as { liked?: boolean; likes?: number; error?: string }
  if (result.error) return { error: result.error }

  if (result.liked) {
    const { data: post } = await adminDb
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single()
    if (post && post.user_id !== user.id) {
      await adminDb.from('notifications').upsert(
        { user_id: post.user_id, actor_id: user.id, type: 'like', post_id: postId },
        { onConflict: 'user_id,actor_id,type,post_id', ignoreDuplicates: true }
      )
    }
  }

  return { liked: result.liked, likes: result.likes }
}

export async function getLikedPostIds(postIds: string[]): Promise<string[]> {
  if (!postIds.length) return []
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return []

  const { data, error } = await db
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds)

  if (error) console.error('[getLikedPostIds] hata:', error)
  return (data ?? []).map((r: { post_id: string }) => r.post_id)
}

// ── Yorum işlemleri ────────────────────────────────────────────

export async function getComments(postId: string) {
  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('community_comments')
    .select('*, profiles!community_comments_user_id_fkey(username, full_name, avatar_url)')
    .eq('post_id', postId)
    .order('is_best_answer', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[getComments] hata:', error)
    return { error: 'Yorumlar yüklenemedi.' }
  }
  return { data }
}

export async function addComment(params: {
  postId: string
  content: string
  technicalNote?: string
  suggestion?: string
}) {
  const { postId, content, technicalNote, suggestion } = params
  const db = await getDB()
  const adminDb = createAdminClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { data: profile, error: profileError } = await adminDb
    .from('profiles')
    .select('subscription_tier, username, full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) return { error: `Profil sorgu hatası: ${profileError.message}` }
  if (!profile) return { error: 'Profil bulunamadı.' }
  if (!['m2', 'm3'].includes(profile.subscription_tier)) {
    return { error: `Yorum yazmak için M2+ planı gerekiyor.` }
  }

  if (!content.trim()) return { error: 'Yorum boş olamaz.' }

  // Tip bazlı yapılandırılmış yorum validasyonu
  const { data: post } = await adminDb
    .from('community_posts')
    .select('user_id, post_type')
    .eq('id', postId)
    .single()

  if (post && ['consultation', 'critique_request'].includes(post.post_type)) {
    if (!technicalNote?.trim()) return { error: 'Teknik Değerlendirme alanı zorunludur.' }
    if (!suggestion?.trim()) return { error: 'Önerim alanı zorunludur.' }
  }

  const { data: inserted, error } = await db
    .from('community_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
      technical_note: technicalNote?.trim() ?? null,
      suggestion: suggestion?.trim() ?? null,
    })
    .select('id, post_id, user_id, content, created_at, helpful_count, is_best_answer, technical_note, suggestion')
    .single()

  if (error || !inserted) return { error: 'Yorum gönderilemedi.' }

  if (post && post.user_id !== user.id) {
    await adminDb.from('notifications').insert({
      user_id: post.user_id,
      actor_id: user.id,
      type: 'comment',
      post_id: postId,
    })
  }

  await checkAndAwardBadges(user.id)

  return {
    data: {
      ...inserted,
      profiles: {
        username: profile.username ?? null,
        full_name: profile.full_name ?? null,
        avatar_url: profile.avatar_url ?? null,
      },
    },
  }
}

// createComment alias (geriye dönük uyumluluk)
export async function createComment(postId: string, content: string) {
  return addComment({ postId, content })
}

export async function markBestAnswer(
  commentId: string,
  postId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const db = await getDB()
    const adminDb = createAdminClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return { error: 'Oturum açmanız gerekiyor.' }

    const { data: post } = await adminDb
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!post || post.user_id !== user.id) {
      return { error: 'Yalnızca kendi gönderinizde en iyi yanıtı seçebilirsiniz.' }
    }

    // Önce tüm yorumları sıfırla
    await adminDb
      .from('community_comments')
      .update({ is_best_answer: false })
      .eq('post_id', postId)

    // Seçilen yorumu işaretle
    const { data: updatedComment, error } = await adminDb
      .from('community_comments')
      .update({ is_best_answer: true })
      .eq('id', commentId)
      .select('user_id')
      .single()

    if (error) return { error: 'Yanıt işaretlenemedi.' }

    // Yorum sahibinin solution_score'unu artır
    if (updatedComment?.user_id) {
      const { data: p, error: selErr } = await adminDb
        .from('profiles')
        .select('solution_score')
        .eq('id', updatedComment.user_id)
        .maybeSingle()

      if (selErr) {
        console.error('[markBestAnswer:scoreSelect]', selErr)
      } else {
        const { error: updErr } = await adminDb
          .from('profiles')
          .update({ solution_score: (p?.solution_score ?? 0) + 1 })
          .eq('id', updatedComment.user_id)
        if (updErr) console.error('[markBestAnswer:scoreUpdate]', updErr)
      }

      await checkAndAwardBadges(updatedComment.user_id)
    }

    return { success: true }
  } catch (err) {
    console.error('[markBestAnswer] hata:', err)
    return { error: 'İşlem başarısız.' }
  }
}

export async function markHelpful(
  commentId: string
): Promise<{ helpful_count?: number; error?: string }> {
  try {
    const db = await getDB()
    const adminDb = createAdminClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return { error: 'Oturum açmanız gerekiyor.' }

    const { data: profile } = await adminDb
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || !['m2', 'm3'].includes(profile.subscription_tier)) {
      return { error: 'Bu özellik M2+ planında mevcut.' }
    }

    // Kendi yorumuna oy verme kontrolü
    const { data: comment } = await adminDb
      .from('community_comments')
      .select('user_id, helpful_count')
      .eq('id', commentId)
      .single()

    if (comment?.user_id === user.id) return { error: 'Kendi yorumunuza oy veremezsiniz.' }

    // Toggle: mevcut oy varsa sil, yoksa ekle
    const { data: existing } = await db
      .from('comment_helpful_votes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .maybeSingle()

    let newCount = comment?.helpful_count ?? 0

    if (existing) {
      await db.from('comment_helpful_votes').delete().eq('user_id', user.id).eq('comment_id', commentId)
      newCount = Math.max(0, newCount - 1)
    } else {
      await db.from('comment_helpful_votes').insert({ user_id: user.id, comment_id: commentId })
      newCount = newCount + 1
    }

    await adminDb.from('community_comments').update({ helpful_count: newCount }).eq('id', commentId)

    return { helpful_count: newCount }
  } catch (err) {
    console.error('[markHelpful] hata:', err)
    return { error: 'İşlem başarısız.' }
  }
}

// ── Hashtag işlemleri ─────────────────────────────────────────

export async function getHashtags(search?: string): Promise<Hashtag[]> {
  const adminDb = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = adminDb
    .from('hashtags')
    .select('id, name, post_count, created_at')
    .order('post_count', { ascending: false })

  if (search) {
    q = q.ilike('name', `${search.toLowerCase()}%`).limit(8)
  } else {
    q = q.limit(15)
  }

  const { data } = await q
  return data ?? []
}

// Alias for backward compatibility
export async function searchHashtags(query: string): Promise<Hashtag[]> {
  return getHashtags(query)
}

export async function createHashtag(name: string): Promise<{ data?: Hashtag; error?: string }> {
  try {
    const adminDb = createAdminClient()
    const normalized = name.toLowerCase().replace(/[^a-zğüşıöç0-9_]/g, '')
    if (!normalized || normalized.length < 2) return { error: 'Geçersiz hashtag adı.' }

    const { data, error } = await adminDb
      .from('hashtags')
      .upsert({ name: normalized }, { onConflict: 'name' })
      .select('id, name, post_count, created_at')
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch (err) {
    console.error('[createHashtag] hata:', err)
    return { error: 'Hashtag oluşturulamadı.' }
  }
}

export async function getTrendingHashtags(): Promise<Hashtag[]> {
  try {
    const adminDb = createAdminClient()
    const { data, error } = await adminDb
      .from('hashtags')
      .select('id, name, post_count, created_at')
      .order('post_count', { ascending: false })
      .limit(10)
    if (error) { console.error('[getTrendingHashtags] Sorgu hatası:', error); return [] }
    return data ?? []
  } catch (err) {
    console.error('[getTrendingHashtags] Beklenmeyen hata:', err)
    return []
  }
}

// ── Arama ──────────────────────────────────────────────────────

export async function searchCommunity(
  query: string,
  type: 'all' | 'posts' | 'users' | 'hashtags' = 'all',
  page = 0
) {
  const adminDb = createAdminClient()
  const LIMIT = 10
  const offset = page * LIMIT
  const results: { posts?: unknown[]; users?: unknown[]; hashtags?: unknown[] } = {}

  if (type === 'all' || type === 'posts') {
    const { data } = await adminDb
      .from('community_posts')
      .select('*, profiles!community_posts_user_id_fkey(username, full_name, avatar_url)')
      .textSearch('search_vector', query, { type: 'plain', config: 'turkish' })
      .order('created_at', { ascending: false })
      .range(offset, offset + LIMIT - 1)
    results.posts = data ?? []
  }

  if (type === 'all' || type === 'users') {
    const { data } = await adminDb
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, subscription_tier')
      .textSearch('search_vector', query, { type: 'plain', config: 'simple' })
      .range(offset, offset + LIMIT - 1)
    results.users = data ?? []
  }

  if (type === 'all' || type === 'hashtags') {
    const { data } = await adminDb
      .from('hashtags')
      .select('id, name, post_count')
      .ilike('name', `%${query.toLowerCase()}%`)
      .order('post_count', { ascending: false })
      .range(offset, offset + LIMIT - 1)
    results.hashtags = data ?? []
  }

  return results
}

// ── Bildirimler ───────────────────────────────────────────────

export async function getNotifications(page = 0) {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const LIMIT = 20
  const from = page * LIMIT

  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('notifications')
    .select('*, actor:profiles!actor_id(username, full_name, avatar_url), post:community_posts!post_id(content, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + LIMIT - 1)

  if (error) return { error: 'Bildirimler yüklenemedi.' }
  return { data: data as Notification[] }
}

export async function markNotificationsRead(): Promise<{ success?: boolean; error?: string }> {
  const db = await getDB()
  const adminDb = createAdminClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { error } = await adminDb
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) return { error: 'Bildirimler güncellenemedi.' }
  return { success: true }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const db = await getDB()
  const adminDb = createAdminClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return 0

  const { count, error } = await adminDb
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) console.error('[getUnreadNotificationCount] hata:', error)
  return count ?? 0
}

// ── Kaydet / Bookmark ─────────────────────────────────────────

export async function savePost(postId: string): Promise<{ saved?: boolean; error?: string }> {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { error } = await db
    .from('saved_posts')
    .insert({ user_id: user.id, post_id: postId })
  if (error) return { error: 'Gönderi kaydedilemedi.' }
  return { saved: true }
}

export async function unsavePost(postId: string): Promise<{ saved?: boolean; error?: string }> {
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const { error } = await db
    .from('saved_posts')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId)
  if (error) return { error: 'Kayıt kaldırılamadı.' }
  return { saved: false }
}

export async function getSavedPostIds(postIds: string[]): Promise<string[]> {
  if (!postIds.length) return []
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return []

  const { data, error } = await db
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds)

  if (error) console.error('[getSavedPostIds] hata:', error)
  return (data ?? []).map((r: { post_id: string }) => r.post_id)
}

export async function getSavedPosts(page = 0, limit = 20) {
  try {
    const db = await getDB()
    const adminDb = createAdminClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return { error: 'Oturum açmanız gerekiyor.' }

    const from = page * limit
    const { data: savedData } = await adminDb
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (!savedData?.length) return { data: [] }

    const postIds = (savedData as { post_id: string }[]).map(s => s.post_id)

    const { data, error } = await adminDb
      .from('community_posts')
      .select('*, profiles(username, full_name, avatar_url, subscription_tier, posts_count)')
      .in('id', postIds)

    if (error) return { error: 'Kaydedilen gönderiler yüklenemedi.' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ordered = postIds.map(id => (data ?? []).find((p: any) => p.id === id)).filter(Boolean)
    return { data: ordered }
  } catch (err) {
    console.error('[getSavedPosts] Hata:', err)
    return { error: 'Kaydedilen gönderiler yüklenemedi.' }
  }
}

// ── Profil ────────────────────────────────────────────────────

const PROFILE_SELECT = 'id, username, full_name, avatar_url, bio, cover_url, posts_count, subscription_tier, specialty, experience_years, technical_score, solution_score, teaching_score'

export async function getProfileStats(userId: string) {
  const db = await getDB()
  const { data, error } = await db
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .single()
  if (error) return { error: 'Profil bulunamadı.' }
  return { data }
}

export async function getProfileByUsername(username: string) {
  const adminDb = createAdminClient()
  const { data, error } = await adminDb
    .from('profiles')
    .select(PROFILE_SELECT + ', created_at')
    .eq('username', username.toLowerCase())
    .maybeSingle()
  if (error || !data) return { error: 'Kullanıcı bulunamadı.' }
  return { data }
}

// Alias
export async function getUserProfile(username: string) {
  return getProfileByUsername(username)
}

export async function getMyProfile() {
  try {
    const db = await getDB()
    const adminDb = createAdminClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return { error: 'Oturum açmanız gerekiyor.' }

    const { data, error } = await adminDb
      .from('profiles')
      .select(PROFILE_SELECT + ', created_at')
      .eq('id', user.id)
      .single()

    if (error) return { error: 'Profil bulunamadı.' }
    return { data }
  } catch (err) {
    console.error('[getMyProfile] hata:', err)
    return { error: 'Profil yüklenemedi.' }
  }
}

export async function getUserPosts(
  userId: string,
  options?: { post_type?: PostType; page?: number; limit?: number }
) {
  const adminDb = createAdminClient()
  const { page = 0, limit = 20, post_type } = options ?? {}
  const from = page * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = adminDb
    .from('community_posts')
    .select(POST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (post_type) q = q.eq('post_type', post_type)

  const { data, error } = await q
  if (error) return { error: 'Gönderiler yüklenemedi.' }
  return { data }
}

export async function getUserComments(userId: string, page = 0) {
  const adminDb = createAdminClient()
  const LIMIT = 20
  const from = page * LIMIT

  const { data, error } = await adminDb
    .from('community_comments')
    .select('*, community_posts!inner(id, title, post_type, content)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + LIMIT - 1)

  if (error) return { error: 'Yorumlar yüklenemedi.' }
  return { data }
}

export async function updateProfile(data: {
  full_name?: string
  username?: string
  avatar_url?: string
  bio?: string
  cover_url?: string
  specialty?: string
  experience_years?: number
}): Promise<{ success?: boolean; error?: string }> {
  const adminDb = createAdminClient()
  const db = await getDB()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { error: 'Oturum açmanız gerekiyor.' }

  const updates: Record<string, string | number> = {}
  if (data.full_name !== undefined) updates.full_name = data.full_name.trim()
  if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url.trim()
  if (data.cover_url !== undefined) updates.cover_url = data.cover_url.trim()
  if (data.specialty !== undefined) updates.specialty = data.specialty.trim()

  if (data.experience_years !== undefined) {
    const yrs = Math.round(data.experience_years)
    if (yrs < 0 || yrs > 50) return { error: 'Deneyim yılı 0–50 arasında olmalıdır.' }
    updates.experience_years = yrs
  }

  if (data.bio !== undefined) {
    if (data.bio.length > 160) return { error: 'Bio en fazla 160 karakter olabilir.' }
    updates.bio = data.bio.trim()
  }

  if (data.username !== undefined) {
    const slug = data.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!slug) return { error: 'Geçersiz kullanıcı adı.' }
    if (slug.length < 3) return { error: 'Kullanıcı adı en az 3 karakter olmalı.' }
    if (slug.length > 30) return { error: 'Kullanıcı adı en fazla 30 karakter olabilir.' }
    const { data: existing } = await adminDb
      .from('profiles')
      .select('id')
      .eq('username', slug)
      .neq('id', user.id)
      .maybeSingle()
    if (existing) return { error: 'Bu kullanıcı adı zaten kullanılıyor.' }
    updates.username = slug
  }

  if (!Object.keys(updates).length) return { success: true }

  const { error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile] UPDATE hatası:', error)
    return { error: 'Profil güncellenemedi.' }
  }
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const adminDb = createAdminClient()
  const { data } = await adminDb
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at')
  return (data ?? []) as UserBadge[]
}

// ── Keşfet ───────────────────────────────────────────────────

export async function getPopularPosts(page = 0, limit = 20) {
  try {
    const adminDb = createAdminClient()
    const from = page * limit
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await adminDb
      .from('community_posts')
      .select(POST_SELECT)
      .gte('created_at', cutoff)
      .order('likes', { ascending: false })
      .range(from, from + limit - 1)

    if (error) { console.error('[getPopularPosts] Sorgu hatası:', error); return { data: [] } }
    return { data: data ?? [] }
  } catch (err) {
    console.error('[getPopularPosts] Beklenmeyen hata:', err)
    return { data: [] }
  }
}

export async function getUserTopHashtags(userId: string): Promise<{ name: string; count: number }[]> {
  const adminDb = createAdminClient()

  const { data: posts } = await adminDb
    .from('community_posts')
    .select('id')
    .eq('user_id', userId)

  if (!posts?.length) return []

  const postIds = posts.map((p: { id: string }) => p.id)

  const { data: ph } = await adminDb
    .from('post_hashtags')
    .select('hashtag_id, hashtags(name)')
    .in('post_id', postIds)

  if (!ph?.length) return []

  const counts: Record<string, number> = {}
  for (const row of ph) {
    const name = (row.hashtags as { name: string } | null)?.name
    if (name) counts[name] = (counts[name] ?? 0) + 1
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))
}

export async function getUserLikedPosts(userId: string, page = 0, limit = 20) {
  const adminDb = createAdminClient()
  const from = page * limit

  const { data: likes } = await adminDb
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (!likes?.length) return { data: [] }

  const postIds = likes.map((l: { post_id: string }) => l.post_id)

  const { data, error } = await adminDb
    .from('community_posts')
    .select(POST_SELECT)
    .in('id', postIds)
    .order('created_at', { ascending: false })

  if (error) return { error: 'Beğenilen gönderiler yüklenemedi.' }
  return { data: data ?? [] }
}

// ── Sidebar verisi ─────────────────────────────────────────────

type UnansweredPost = {
  id: string; title: string | null; content: string | null; created_at: string
  profiles: { username: string | null; avatar_url: string | null } | null
}

export async function getSidebarData(): Promise<{
  unanswered: {
    consultation: UnansweredPost[]
    critique_request: UnansweredPost[]
  }
  trendingHashtags: Hashtag[]
  activeMembers: ActiveMember[]
}> {
  try {
    const adminDb = createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [consultResult, critiqueResult, hashtagResult, postsResult, commentsResult] = await Promise.all([
      adminDb
        .from('community_posts')
        .select('id, title, content, created_at, profiles!community_posts_user_id_fkey(username, avatar_url)')
        .eq('post_type', 'consultation')
        .eq('comment_count', 0)
        .order('created_at', { ascending: false })
        .limit(3),
      adminDb
        .from('community_posts')
        .select('id, title, content, created_at, profiles!community_posts_user_id_fkey(username, avatar_url)')
        .eq('post_type', 'critique_request')
        .eq('comment_count', 0)
        .order('created_at', { ascending: false })
        .limit(3),
      adminDb
        .from('hashtags')
        .select('id, name, post_count, created_at')
        .order('post_count', { ascending: false })
        .limit(5),
      adminDb
        .from('community_posts')
        .select('user_id')
        .gte('created_at', sevenDaysAgo),
      adminDb
        .from('community_comments')
        .select('user_id')
        .gte('created_at', sevenDaysAgo),
    ])

    // Aktif üye hesaplama
    const activityMap: Record<string, number> = {}
    for (const row of postsResult.data ?? []) {
      activityMap[row.user_id] = (activityMap[row.user_id] ?? 0) + 2
    }
    for (const row of commentsResult.data ?? []) {
      activityMap[row.user_id] = (activityMap[row.user_id] ?? 0) + 1
    }

    const topUserIds = Object.entries(activityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)

    let activeMembers: ActiveMember[] = []
    if (topUserIds.length) {
      const { data: memberProfiles } = await adminDb
        .from('profiles')
        .select('id, username, full_name, avatar_url, specialty')
        .in('id', topUserIds)

      activeMembers = (topUserIds
        .map(id => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = (memberProfiles ?? []).find((m: any) => m.id === id)
          if (!p) return null
          return { ...p, activity_count: activityMap[id] ?? 0 } as ActiveMember
        })
        .filter(Boolean)) as ActiveMember[]
    }

    return {
      unanswered: {
        consultation: (consultResult.data ?? []) as UnansweredPost[],
        critique_request: (critiqueResult.data ?? []) as UnansweredPost[],
      },
      trendingHashtags: hashtagResult.data ?? [],
      activeMembers,
    }
  } catch (err) {
    console.error('[getSidebarData] hata:', err)
    return { unanswered: { consultation: [], critique_request: [] }, trendingHashtags: [], activeMembers: [] }
  }
}
