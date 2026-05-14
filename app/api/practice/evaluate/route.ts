import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `Sen bir diş teknolojisi eğitim değerlendirme asistanısın.
Kullanıcıların vaka sorularına verdiği yanıtları değerlendiriyorsun.
Her zaman SADECE geçerli JSON döndür, başka hiçbir metin ekleme.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, caseData, userAnswers, apiKey } = body as {
      sessionId: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      caseData: any
      userAnswers: Record<string, string | number>
      apiKey: string
    }

    if (!apiKey) {
      return Response.json({ error: 'API key bulunamadı.' }, { status: 400 })
    }

    const questionsText = caseData.questions.map((q: {
      id: string
      question: string
      type: string
      options?: string[]
      correct_option?: number
      explanation: string
    }, i: number) => {
      const userAnswer = userAnswers[q.id]
      const answerText = q.type === 'multiple_choice' && q.options
        ? `Kullanıcının cevabı: ${q.options[userAnswer as number] ?? 'Cevap verilmedi'} (Doğru: ${q.options[q.correct_option ?? 0]})`
        : `Kullanıcının cevabı: ${userAnswer ?? 'Cevap verilmedi'}`

      return `Soru ${i + 1}: ${q.question}
Tip: ${q.type === 'multiple_choice' ? 'Çoktan seçmeli' : 'Açık uçlu'}
${answerText}
Beklenen: ${q.explanation}`
    }).join('\n\n')

    const prompt = `Diş teknolojisi vaka pratiği değerlendirmesi:

Vaka: ${caseData.title}
Senaryo: ${caseData.scenario}

${questionsText}

Bu yanıtları değerlendir ve şu JSON formatını döndür:
{
  "score": 85,
  "feedback": "Genel değerlendirme yazısı (2-3 cümle, Türkçe, profesyonel ton)",
  "question_feedbacks": [
    {
      "question_id": "q1",
      "correct": true,
      "comment": "Bu soru için kısa yorum"
    }
  ],
  "strengths": ["Güçlü yön 1", "Güçlü yön 2"],
  "improvements": ["Geliştirilecek alan 1"]
}

score: 0-100 arası tam sayı. Çoktan seçmeli için kesin doğru/yanlış, açık uçlu için içerik kalitesine göre kısmi puan.`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Değerlendirme yapılamadı.' }, { status: 500 })
    }

    const evaluation = JSON.parse(jsonMatch[0])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    await db
      .from('practice_sessions')
      .update({
        user_answers: userAnswers,
        ai_feedback: evaluation.feedback,
        score: evaluation.score,
        completed: true,
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    return Response.json({ evaluation })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
