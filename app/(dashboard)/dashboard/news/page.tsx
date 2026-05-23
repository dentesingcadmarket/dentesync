import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Newspaper, Clock, ExternalLink } from 'lucide-react'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d < 1) return 'Bugün'
  if (d === 1) return 'Dün'
  if (d < 7) return `${d} gün önce`
  const w = Math.floor(d / 7)
  if (w < 4) return `${w} hafta önce`
  const m = Math.floor(d / 30)
  return `${m} ay önce`
}

export default async function NewsPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: news } = await db
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(30)

  const items = (news ?? []) as {
    id: string
    title: string
    excerpt: string | null
    cover_image_url: string | null
    published_at: string | null
  }[]

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0f1716] via-[#161617] to-[#161617] p-5 lg:p-6">
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#2dd4bf]/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2dd4bf]/20 to-[#2dd4bf]/5 border border-[#2dd4bf]/25 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-[#2dd4bf]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Haberler</h1>
            <p className="text-[#999999] text-sm mt-0.5">Sektör haberleri ve DenteSync duyuruları</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-[#161617] border border-white/[0.06] rounded-2xl">
          <Newspaper className="w-10 h-10 mx-auto mb-3 text-[#525252]" />
          <p className="text-[#999999] text-sm">Henüz haber yok. Yakında içerik gelecek.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href={`/dashboard/news/${item.id}`}
              className={`group relative overflow-hidden rounded-2xl bg-[#161617] border ${
                i === 0
                  ? 'border-[#2dd4bf]/25 md:col-span-2 lg:col-span-2'
                  : 'border-white/[0.06] hover:border-[#2dd4bf]/25'
              } transition-all flex flex-col`}
            >
              {item.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className={`w-full object-cover ${i === 0 ? 'h-56' : 'h-40'} group-hover:scale-[1.02] transition-transform`}
                />
              ) : (
                <div className={`w-full ${i === 0 ? 'h-56' : 'h-40'} bg-gradient-to-br from-[#0f1716] to-[#161617] flex items-center justify-center`}>
                  <Newspaper className="w-10 h-10 text-[#525252]" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                {i === 0 && (
                  <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] text-[10px] font-medium mb-2 border border-[#2dd4bf]/30">
                    Son Haber
                  </span>
                )}
                <h2 className={`text-white font-medium leading-snug mb-2 ${i === 0 ? 'text-lg line-clamp-2' : 'text-sm line-clamp-2'}`}>
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p className="text-[#999999] text-xs leading-relaxed line-clamp-2 mb-3 flex-1">{item.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04]">
                  {item.published_at && (
                    <span className="flex items-center gap-1 text-[#737373] text-[11px]">
                      <Clock className="w-3 h-3" />
                      {timeAgo(item.published_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#2dd4bf] text-xs group-hover:translate-x-0.5 transition-transform">
                    Devamını oku <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
