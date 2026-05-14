import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `Sen DenteSync Planım asistanısın. Diş teknisyenlerine kişisel gelişim, kariyer ve teknik hedef planları oluşturmalarında yardım ediyorsun.

Kullanıcı bir hedef veya problem paylaştığında, net ve uygulanabilir adımlar üret.

ÖNEMLİ KURAL: Her yanıtında EN FAZLA BİR yeni adım üret. Adımları sırayla, birer birer ekle.
Kullanıcı mevcut adımı tamamladığında bir sonraki adımı üret.

Yeni bir adım üretmek istediğinde, yanıtının EN SONUNA (başka hiçbir şey ekleme) şu bloğu ekle:

<plan_step>
{"title": "Kısa adım başlığı (max 60 karakter)", "description": "Adımın ne gerektirdiğini açıklayan 1-2 cümle."}
</plan_step>

Eğer planın tamamlandığını, ya da yeni adım gerekmediğini düşünüyorsan bu bloğu EKLEME.

Her zaman Türkçe yanıt ver. Profesyonel ama sıcak bir ton kullan. Markdown formatı kullan.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Oturum açmanız gerekiyor.' }), { status: 401 })
    }

    const body = await request.json()
    const { messages, apiKey, currentSteps } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      apiKey: string
      currentSteps?: Array<{ title: string; status: string }>
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key bulunamadı.' }), { status: 400 })
    }

    let systemWithContext = SYSTEM_PROMPT
    if (currentSteps && currentSteps.length > 0) {
      const stepsText = currentSteps
        .map((s, i) => `${i + 1}. ${s.title} [${s.status}]`)
        .join('\n')
      systemWithContext += `\n\nMevcut plan adımları:\n${stepsText}`
    }

    const client = new Anthropic({ apiKey })

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemWithContext,
      messages,
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

          // Extract plan_step JSON if present
          const stepMatch = fullText.match(/<plan_step>([\s\S]*?)<\/plan_step>/)
          if (stepMatch) {
            try {
              const stepData = JSON.parse(stepMatch[1].trim())
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ step: stepData })}\n\n`)
              )
            } catch {
              // malformed JSON — skip
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
