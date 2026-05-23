'use client'

import { motion } from 'framer-motion'
import { Hash, TrendingUp, Heart } from 'lucide-react'
import Link from 'next/link'
import type { Hashtag, CommunityPost, Profile } from '@/lib/supabase/types'

type PostWithProfile = CommunityPost & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'> | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m}dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa önce`
  return `${Math.floor(h / 24)}g önce`
}

interface Props {
  trendingHashtags: Hashtag[]
  popularPosts: PostWithProfile[]
}

export function ExplorePageClient({ trendingHashtags, popularPosts }: Props) {
  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#2dd4bf]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#ffffff]">Keşfet</h1>
          <p className="text-[#999999] text-sm">Trend içerikler ve popüler gönderiler</p>
        </div>
      </div>

      {/* Trending Hashtagler */}
      {trendingHashtags.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-[#2dd4bf]" />
            <h2 className="text-[#ffffff] text-sm font-semibold">Trend Etiketler</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map((tag, i) => (
              <Link key={tag.id} href={`/dashboard/community/hashtag/${tag.name}`} className="group">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161617] border border-[rgba(229,231,235,0.08)] group-hover:border-[#2dd4bf]/40 group-hover:bg-[#2dd4bf]/5 transition-colors"
                >
                  <Hash className="w-3.5 h-3.5 text-[#2dd4bf]" />
                  <span className="text-[#ffffff] text-sm font-medium">{tag.name}</span>
                  <span className="text-[#999999] text-xs">{tag.post_count}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popüler Gönderiler */}
      {popularPosts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-anchor-graphite" />
            <h2 className="text-[#ffffff] text-sm font-semibold">Popüler Gönderiler</h2>
            <span className="text-[#999999] text-xs">(son 24 saat)</span>
          </div>
          <div className="space-y-3">
            {popularPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-[#161617] border border-[rgba(229,231,235,0.08)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center text-[#2dd4bf] text-xs font-semibold shrink-0 overflow-hidden">
                    {post.profiles?.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={post.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (post.profiles?.full_name || post.profiles?.username || '?').charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/community/profile/${post.profiles?.username}`}
                      className="text-[#ffffff] text-xs font-medium hover:underline truncate block"
                    >
                      {post.profiles?.full_name || post.profiles?.username || 'Kullanıcı'}
                    </Link>
                    <p className="text-[#999999] text-[10px]">{timeAgo(post.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-anchor-graphite shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-anchor-graphite" />
                    <span className="text-xs font-medium">{post.likes}</span>
                  </div>
                </div>
                {post.content && (
                  <p className="text-[#999999] text-sm leading-relaxed line-clamp-3">{post.content}</p>
                )}
                {post.image_url && !post.content && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt="Gönderi" loading="lazy"
                    className="w-full rounded-xl mt-2 max-h-40 object-cover border border-[rgba(229,231,235,0.08)]" />
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {trendingHashtags.length === 0 && popularPosts.length === 0 && (
        <div className="text-center py-16 text-[#999999]">
          <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-[#999999]">Henüz keşfedilecek içerik yok.</p>
          <p className="text-xs mt-1">Toplulukta gönderi paylaşıldıkça burada görünecek.</p>
        </div>
      )}
    </div>
  )
}
