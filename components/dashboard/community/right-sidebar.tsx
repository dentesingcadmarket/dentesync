'use client'

import Link from 'next/link'
import { Hash, Users, MessageCircle, Eye } from 'lucide-react'
import type { Hashtag, ActiveMember } from '@/lib/supabase/types'

interface UnansweredPost {
  id: string
  title: string | null
  content: string | null
  created_at: string
  profiles: { username: string | null; avatar_url: string | null } | null
}

interface SidebarData {
  unanswered: {
    consultation: UnansweredPost[]
    critique_request: UnansweredPost[]
  }
  trendingHashtags: Hashtag[]
  activeMembers: ActiveMember[]
}

interface RightSidebarProps {
  sidebarData: SidebarData
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-[#999999]">{icon}</div>
      <h3 className="text-[#999999] text-xs font-semibold uppercase tracking-wider">{title}</h3>
    </div>
  )
}

export function RightSidebar({ sidebarData }: RightSidebarProps) {
  const { unanswered, trendingHashtags, activeMembers } = sidebarData

  const hasUnanswered =
    unanswered.consultation.length > 0 || unanswered.critique_request.length > 0

  return (
    <div className="p-4 space-y-6 sticky top-0">
      {/* Gündem */}
      {hasUnanswered && (
        <section>
          <SectionHeader icon={<MessageCircle className="w-3.5 h-3.5" />} title="Yanıt Bekleyenler" />
          <div className="space-y-2">
            {unanswered.consultation.map(post => (
              <Link
                key={post.id}
                href={`/dashboard/community`}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161617] border border-[rgba(255,255,255,0.06)] hover:border-anchor-graphite0/30 hover:bg-anchor-graphite0/5 transition-all group"
              >
                <span className="w-2 h-2 rounded-full bg-anchor-graphite shrink-0 mt-1.5" />
                <div className="min-w-0">
                  <p className="text-[#ffffff] text-xs font-medium truncate group-hover:text-anchor-graphite transition-colors">
                    {post.title || post.content?.slice(0, 50) || 'Danışma'}
                  </p>
                  <p className="text-[#999999] text-[10px] mt-0.5">@{post.profiles?.username}</p>
                </div>
              </Link>
            ))}

            {unanswered.critique_request.map(post => (
              <Link
                key={post.id}
                href={`/dashboard/community`}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#161617] border border-[rgba(255,255,255,0.06)] hover:border-primary0/30 hover:bg-primary0/5 transition-all group"
              >
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                <div className="min-w-0">
                  <p className="text-[#ffffff] text-xs font-medium truncate group-hover:text-primary transition-colors">
                    {post.content?.slice(0, 50) || 'Kritik İsteği'}
                  </p>
                  <p className="text-[#999999] text-[10px] mt-0.5">@{post.profiles?.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trend Etiketler */}
      {trendingHashtags.length > 0 && (
        <section>
          <SectionHeader icon={<Hash className="w-3.5 h-3.5" />} title="Trend Etiketler" />
          <div className="space-y-1.5">
            {trendingHashtags.map(tag => (
              <Link
                key={tag.id}
                href={`/dashboard/community/hashtag/${tag.name}`}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#161617] border border-[rgba(255,255,255,0.06)] hover:border-[#2563eb]/30 hover:bg-[#2563eb]/5 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-3 h-3 text-[#2563eb]" />
                  <span className="text-[#ffffff] text-xs group-hover:text-[#2563eb] transition-colors">{tag.name}</span>
                </div>
                <span className="text-[#999999] text-[10px]">{tag.post_count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Aktif Üyeler */}
      {activeMembers.length > 0 && (
        <section>
          <SectionHeader icon={<Users className="w-3.5 h-3.5" />} title="Aktif Üyeler" />
          <div className="space-y-2">
            {activeMembers.map(member => (
              <Link
                key={member.id}
                href={`/dashboard/community/profile/${member.username}`}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161617] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563eb]/20 flex items-center justify-center text-[#2563eb] text-xs font-semibold shrink-0 overflow-hidden">
                  {member.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (member.full_name || member.username || '?').charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#ffffff] text-xs font-medium truncate">{member.full_name || member.username}</p>
                  <p className="text-[#999999] text-[10px] truncate">{member.specialty ?? '@' + member.username}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#2563eb] text-xs font-semibold">{member.activity_count}</p>
                  <p className="text-[#999999] text-[10px]">katkı</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!hasUnanswered && trendingHashtags.length === 0 && activeMembers.length === 0 && (
        <div className="text-center py-6">
          <Eye className="w-6 h-6 mx-auto mb-2 text-[#404040]" />
          <p className="text-[#999999] text-xs">Topluluk verisi yükleniyor...</p>
        </div>
      )}
    </div>
  )
}
