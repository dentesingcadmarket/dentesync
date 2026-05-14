import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `Sen DenteSync D-Console'sun. Diş teknisyenlerine teknik konularda yardım ediyorsun.
Protez, kron, köprü, implant, zirkonyum, seramik, metal alaşım, akrilik, silikon, CAD/CAM teknolojileri konularında uzmansın.
Kullanıcıların vaka analizlerini yapmalarına, hataları tespit etmelerine ve çözüm üretmelerine yardım ediyorsun.
Her zaman Türkçe yanıt ver. Teknik ve profesyonel ton kullan.
Gerektiğinde adım adım açıklama yap. Markdown formatını kullan.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Oturum açmanız gerekiyor.' }), { status: 401 })
    }

    const body = await request.json()
    const { messages, apiKey, sessionId } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      apiKey: string
      sessionId?: string
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key bulunamadı.' }), { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
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
              const text = chunk.delta.text
              fullText += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Mesajı session'a kaydet
          if (sessionId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const db = supabase as any
            const { data: session } = await db
              .from('console_sessions')
              .select('messages')
              .eq('id', sessionId)
              .eq('user_id', user.id)
              .maybeSingle()

            const existing = session?.messages ?? []
            const lastUserMsg = messages[messages.length - 1]
            const updatedMessages = [
              ...existing,
              lastUserMsg,
              { role: 'assistant', content: fullText },
            ]

            await db
              .from('console_sessions')
              .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
              .eq('id', sessionId)
              .eq('user_id', user.id)
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
