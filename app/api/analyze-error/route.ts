import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `Sen DenteSync Hata Analizi uzmanısın. Diş laboratuvarı üretim hatalarını analiz ederek teknisyenlere rehberlik ediyorsun.

Kullanıcı bir hata tanımladığında aşağıdaki başlıklar altında kapsamlı analiz yap:

## Kök Neden Analizi
Hatanın neden oluştuğunu teknik olarak açıkla.

## Acil Çözüm Adımları
Mevcut sorunu düzeltmek için numaralı adımlar.

## Önleme Stratejisi
Bu hatanın tekrarlanmasını önlemek için protokoller.

## Kalite Kontrol Noktaları
Dikkat edilmesi gereken kritik parametreler ve kontrol listesi.

Yanıtının EN SONUNA (başka hiçbir şey ekleme) şu bloğu ekle:

<analysis_meta>
{"severity": "low|medium|high|critical", "roadmap_impact": "Bu hatanın üretim sürecine kısa etkisi"}
</analysis_meta>

Severity seçim kriteri:
- low: Küçük estetik hata, üretimi etkilemiyor
- medium: Yeniden işleme/düzeltme gerektirebilir
- high: Vaka yeniden başlama riski, ciddi zaman kaybı
- critical: Hasta güvenliği riski veya büyük malzeme kaybı

Her zaman Türkçe yanıt ver. Markdown formatı kullan.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Oturum açmanız gerekiyor.' }), { status: 401 })
    }

    const body = await request.json()
    const { errorDescription, apiKey, caseTitle } = body as {
      errorDescription: string
      apiKey: string
      caseTitle?: string
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key bulunamadı.' }), { status: 400 })
    }

    if (!errorDescription?.trim()) {
      return new Response(JSON.stringify({ error: 'Hata açıklaması gerekli.' }), { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const userMessage = caseTitle
      ? `Vaka: ${caseTitle}\n\nHata: ${errorDescription}`
      : `Hata: ${errorDescription}`

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullText = ''
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              fullText += chunk.delta.text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
              )
            }
          }

          // Extract meta JSON
          const metaMatch = fullText.match(/<analysis_meta>([\s\S]*?)<\/analysis_meta>/)
          if (metaMatch) {
            try {
              const meta = JSON.parse(metaMatch[1].trim())
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ meta })}\n\n`)
              )
            } catch {
              // fallback meta
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ meta: { severity: 'medium', roadmap_impact: 'Analiz tamamlandı.' } })}\n\n`)
              )
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
}
