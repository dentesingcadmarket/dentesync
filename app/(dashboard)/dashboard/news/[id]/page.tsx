import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Clock, Newspaper } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface Props {
  params: { id: string }
}

export default async function NewsDetailPage({ params }: Props) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: item } = await db
    .from('news')
    .select('*')
    .eq('id', params.id)
    .eq('is_published', true)
    .maybeSingle()

  if (!item) notFound()

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8">
      {/* Back link */}
      <Link
        href="/dashboard/news"
        className="inline-flex items-center gap-2 text-[#999999] hover:text-[#ffffff] text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Haberlere Dön
      </Link>

      {/* Cover image */}
      {item.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.cover_image_url}
          alt={item.title}
          className="w-full h-56 object-cover rounded-2xl mb-6 border border-[rgba(229,231,235,0.08)]"
        />
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
          <Newspaper className="w-3.5 h-3.5 text-[#2563eb]" />
        </div>
        {item.published_at && (
          <span className="flex items-center gap-1 text-[#999999] text-xs">
            <Clock className="w-3 h-3" />
            {formatDate(item.published_at)}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-[#ffffff] text-2xl font-semibold leading-snug mb-3">
        {item.title}
      </h1>

      {/* Excerpt */}
      {item.excerpt && (
        <p className="text-[#999999] text-base leading-relaxed mb-6 border-l-2 border-[#2563eb]/40 pl-4">
          {item.excerpt}
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-[rgba(229,231,235,0.08)] mb-6" />

      {/* Content */}
      {item.content ? (
        <div className="prose prose-invert prose-sm max-w-none text-[#d4d4d8] leading-relaxed
          prose-headings:text-[#ffffff] prose-headings:font-semibold
          prose-a:text-[#2563eb] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#ffffff]
          prose-code:bg-[#1f1f20] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#2563eb] prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-[#1f1f20] prose-pre:border prose-pre:border-[rgba(229,231,235,0.08)] prose-pre:rounded-xl
          prose-blockquote:border-l-[#2563eb]/60 prose-blockquote:text-[#999999]
          prose-hr:border-[rgba(229,231,235,0.08)]
          prose-li:text-[#d4d4d8]
        ">
          <ReactMarkdown>{item.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-[#999999] text-sm">İçerik henüz eklenmemiş.</p>
      )}
    </div>
  )
}
