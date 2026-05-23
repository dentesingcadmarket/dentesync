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
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-[#2dd4bf]/10 flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-[#2dd4bf]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#ffffff]">Haberler</h1>
          <p className="text-[#999999] text-sm">Sektör haberleri ve DenteSync duyuruları</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-[#999999]">
          <Newspaper className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Henüz haber yok. Yakında içerik gelecek.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`p-5 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)] flex gap-4 ${i === 0 ? 'ring-1 ring-[#2dd4bf]/20' : ''}`}
            >
              {item.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[rgba(255,255,255,0.05)]"
                />
              )}
              <div className="flex-1 min-w-0">
                {i === 0 && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] text-[10px] font-medium mb-2">
                    Son Haber
                  </span>
                )}
                <h2 className="text-[#ffffff] font-medium text-sm mb-1.5 leading-snug">{item.title}</h2>
                {item.excerpt && (
                  <p className="text-[#999999] text-xs leading-relaxed line-clamp-2 mb-2">{item.excerpt}</p>
                )}
                <div className="flex items-center gap-3">
                  {item.published_at && (
                    <span className="flex items-center gap-1 text-[#999999] text-xs">
                      <Clock className="w-3 h-3" />
                      {timeAgo(item.published_at)}
                    </span>
                  )}
                  <Link href={`/dashboard/news/${item.id}`} className="flex items-center gap-1 text-[#2dd4bf] text-xs hover:underline">
                    Devamını oku <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
