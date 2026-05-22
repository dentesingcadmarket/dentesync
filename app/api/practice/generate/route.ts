import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `Sen bir diş teknisyeni eğitim asistanısın. Diş teknolojisi pratiği için gerçekçi vaka senaryoları oluşturuyorsun.
Protez, kron, köprü, implant, zirkonyum, seramik, akrilik, CAD/CAM teknolojileri konularında uzmansın.
Her zaman SADECE geçerli JSON döndür, başka hiçbir metin ekleme.`

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: profile } = await db
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || !['m2', 'm3'].includes(profile.subscription_tier)) {
      return Response.json({ error: 'Bu özellik M2+ planında mevcut.' }, { status: 403 })
    }

    const body = await request.json()
    const { difficulty, category } = body as {
      difficulty: 'kolay' | 'orta' | 'zor'
      category: string
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Servis şu an kullanılamıyor.' }, { status: 503 })
    }

    const difficultyMap = {
      kolay: 'Temel düzey, basit sorular. Çoktan seçmeli ağırlıklı.',
      orta: 'Orta düzey, detaylı analiz gerektiren sorular. Karışık soru tipleri.',
      zor: 'İleri düzey, kompleks klinik vaka. Açık uçlu ve analitik sorular.',
    }

    const prompt = `Diş teknolojisi pratiği için "${category}" konusunda "${difficulty}" seviyesinde bir vaka oluştur.

Zorluk: ${difficultyMap[difficulty]}

Tam olarak şu JSON formatını döndür (başka hiçbir metin olmadan):
{
  "title": "Vakanın kısa başlığı",
  "scenario": "Detaylı klinik senaryo açıklaması (2-4 cümle)",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "question": "Soru metni",
      "type": "multiple_choice",
      "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
      "correct_option": 0,
      "explanation": "Doğru cevabın açıklaması"
    },
    {
      "id": "q2",
      "question": "Açık uçlu soru metni",
      "type": "open",
      "explanation": "Beklenen ideal cevap"
    }
  ]
}

Kolay: 3 çoktan seçmeli soru.
Orta: 2 çoktan seçmeli + 1 açık uçlu soru.
Zor: 1 çoktan seçmeli + 2 açık uçlu soru.
correct_option, 0'dan başlayan indeks olmalıdır.`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Vaka oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 })
    }

    const caseData = JSON.parse(jsonMatch[0])

    const { data: session, error } = await db
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        case_data: caseData,
        user_answers: {},
        completed: false,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: 'Oturum kaydedilemedi.' }, { status: 500 })
    }

    return Response.json({ session, caseData })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sunucu hatası'
    return Response.json({ error: msg }, { status: 500 })
  }
}
