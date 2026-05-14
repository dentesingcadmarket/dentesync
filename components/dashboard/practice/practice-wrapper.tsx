'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Sparkles, ChevronRight, RotateCcw, Trophy,
  CheckCircle2, XCircle, AlertCircle, Loader2, Key, Target,
  Brain, Zap, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { ApiKeyModal } from '@/components/console/api-key-modal'

interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'open'
  options?: string[]
  correct_option?: number
  explanation: string
}

interface CaseData {
  title: string
  scenario: string
  category: string
  difficulty: 'kolay' | 'orta' | 'zor'
  questions: Question[]
}

interface QuestionFeedback {
  question_id: string
  correct: boolean
  comment: string
}

interface Evaluation {
  score: number
  feedback: string
  question_feedbacks: QuestionFeedback[]
  strengths: string[]
  improvements: string[]
}

type Stage = 'setup' | 'generating' | 'practice' | 'evaluating' | 'results'

const CATEGORIES = [
  { id: 'Tam Protez', label: 'Tam Protez', icon: '🦷' },
  { id: 'Parsiyel Protez', label: 'Parsiyel Protez', icon: '🦷' },
  { id: 'Kron & Köprü', label: 'Kron & Köprü', icon: '👑' },
  { id: 'İmplant Üstü Yapı', label: 'İmplant', icon: '🔩' },
  { id: 'Zirkonyum', label: 'Zirkonyum', icon: '💎' },
  { id: 'Seramik', label: 'Seramik', icon: '✨' },
  { id: 'CAD/CAM', label: 'CAD/CAM', icon: '🖥️' },
  { id: 'Akrilik', label: 'Akrilik', icon: '🧪' },
]

const DIFFICULTIES = [
  { id: 'kolay', label: 'Kolay', description: 'Temel kavramlar, 3 soru', color: '#10b981' },
  { id: 'orta', label: 'Orta', description: 'Analiz gerektiren, 3 soru', color: '#f59e0b' },
  { id: 'zor', label: 'Zor', description: 'Kompleks vakalar, 3 soru', color: '#ef4444' },
] as const

interface Props {
  hasApiKey: boolean
  apiKey: string | null
}

export function PracticeWrapper({ hasApiKey: initialHasKey, apiKey: initialApiKey }: Props) {
  const [stage, setStage] = useState<Stage>('setup')
  const [difficulty, setDifficulty] = useState<'kolay' | 'orta' | 'zor'>('orta')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [hasApiKey, setHasApiKey] = useState(initialHasKey)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [currentApiKey, setCurrentApiKey] = useState(initialApiKey)
  const confettiFired = useRef(false)

  const fireConfetti = useCallback(() => {
    if (confettiFired.current) return
    confettiFired.current = true
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#2563eb', '#10b981', '#f59e0b', '#f4f4f5'] })
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 100, origin: { y: 0.4 }, angle: 60 })
      confetti({ particleCount: 60, spread: 100, origin: { y: 0.4 }, angle: 120 })
    }, 300)
  }, [])

  useEffect(() => {
    if (stage === 'results' && evaluation && evaluation.score >= 80) {
      fireConfetti()
    }
  }, [stage, evaluation, fireConfetti])

  async function handleGenerate() {
    if (!hasApiKey) { setApiKeyModalOpen(true); return }
    setStage('generating')
    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, category, apiKey: currentApiKey }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Vaka oluşturulamadı.'); setStage('setup'); return }
      setCaseData(data.caseData)
      setSessionId(data.session.id)
      setAnswers({})
      confettiFired.current = false
      setStage('practice')
    } catch {
      toast.error('Bağlantı hatası. Lütfen tekrar deneyin.')
      setStage('setup')
    }
  }

  async function handleEvaluate() {
    if (!caseData || !sessionId) return
    const unanswered = caseData.questions.filter(q => answers[q.id] === undefined || answers[q.id] === '')
    if (unanswered.length > 0) { toast.error('Lütfen tüm soruları cevaplayın.'); return }

    setStage('evaluating')
    try {
      const res = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, caseData, userAnswers: answers, apiKey: currentApiKey }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Değerlendirme yapılamadı.'); setStage('practice'); return }
      setEvaluation(data.evaluation)
      setStage('results')
    } catch {
      toast.error('Bağlantı hatası.')
      setStage('practice')
    }
  }

  function handleReset() {
    setStage('setup')
    setCaseData(null)
    setSessionId(null)
    setAnswers({})
    setEvaluation(null)
    confettiFired.current = false
  }

  const allAnswered = caseData ? caseData.questions.every(q =>
    q.type === 'multiple_choice'
      ? answers[q.id] !== undefined
      : (answers[q.id] as string)?.trim().length > 0
  ) : false

  return (
    <>
      <div className="min-h-full p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {stage === 'setup' && (
            <SetupScreen
              key="setup"
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              category={category}
              setCategory={setCategory}
              hasApiKey={hasApiKey}
              onGenerate={handleGenerate}
              onOpenApiKey={() => setApiKeyModalOpen(true)}
            />
          )}
          {stage === 'generating' && <GeneratingScreen key="generating" />}
          {stage === 'practice' && caseData && (
            <PracticeScreen
              key="practice"
              caseData={caseData}
              answers={answers}
              setAnswers={setAnswers}
              onSubmit={handleEvaluate}
              allAnswered={allAnswered}
            />
          )}
          {stage === 'evaluating' && <EvaluatingScreen key="evaluating" />}
          {stage === 'results' && evaluation && caseData && (
            <ResultsScreen
              key="results"
              evaluation={evaluation}
              caseData={caseData}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </div>

      <ApiKeyModal
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
        hasKey={hasApiKey}
        onKeySaved={async () => {
          const res = await fetch('/api/practice/api-key-check')
          if (res.ok) {
            const { hasKey, apiKey: key } = await res.json()
            setHasApiKey(hasKey)
            setCurrentApiKey(key)
          } else {
            setHasApiKey(false)
            setCurrentApiKey(null)
          }
        }}
      />
    </>
  )
}

function SetupScreen({
  difficulty, setDifficulty, category, setCategory,
  hasApiKey, onGenerate, onOpenApiKey,
}: {
  difficulty: 'kolay' | 'orta' | 'zor'
  setDifficulty: (d: 'kolay' | 'orta' | 'zor') => void
  category: string
  setCategory: (c: string) => void
  hasApiKey: boolean
  onGenerate: () => void
  onOpenApiKey: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-[#2563eb]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#f4f4f5]">Vaka Pratiği</h1>
          <p className="text-[#71717a] text-sm">AI tarafından oluşturulan gerçekçi vakalarla pratik yapın</p>
        </div>
      </div>

      {!hasApiKey && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-[#f4f4f5] text-sm font-medium">API Key Gerekli</p>
            <p className="text-[#71717a] text-xs mt-0.5">Vaka pratiği için Anthropic API key&apos;inizi eklemeniz gerekiyor.</p>
          </div>
          <button
            onClick={onOpenApiKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-medium hover:bg-[#f59e0b]/30 transition-colors"
          >
            <Key className="w-3 h-3" /> Ekle
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        <p className="text-[#f4f4f5] text-sm font-medium">Zorluk Seviyesi</p>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                difficulty === d.id
                  ? 'border-[#2563eb] bg-[#2563eb]/10'
                  : 'border-[rgba(255,255,255,0.07)] bg-[#111114] hover:bg-[#1a1a1f]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[#f4f4f5] text-sm font-medium">{d.label}</span>
              </div>
              <p className="text-[#71717a] text-xs">{d.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[#f4f4f5] text-sm font-medium">Konu</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-2.5 rounded-xl border text-sm transition-all ${
                category === cat.id
                  ? 'border-[#2563eb] bg-[#2563eb]/10 text-[#f4f4f5]'
                  : 'border-[rgba(255,255,255,0.07)] bg-[#111114] text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#1a1a1f]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium text-sm cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        Vaka Oluştur
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

function GeneratingScreen() {
  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
          <Brain className="w-8 h-8 text-[#2563eb]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a0a0b] flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-[#2563eb] animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[#f4f4f5] font-medium">Vaka hazırlanıyor...</p>
        <p className="text-[#71717a] text-sm mt-1">AI seçtiğiniz konuda gerçekçi bir senaryo oluşturuyor</p>
      </div>
    </motion.div>
  )
}

function EvaluatingScreen() {
  return (
    <motion.div
      key="evaluating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center">
          <Zap className="w-8 h-8 text-[#10b981]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a0a0b] flex items-center justify-center">
          <Loader2 className="w-3 h-3 text-[#10b981] animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[#f4f4f5] font-medium">Yanıtlarınız değerlendiriliyor...</p>
        <p className="text-[#71717a] text-sm mt-1">AI cevaplarınızı analiz ediyor</p>
      </div>
    </motion.div>
  )
}

function PracticeScreen({
  caseData, answers, setAnswers, onSubmit, allAnswered,
}: {
  caseData: CaseData
  answers: Record<string, string | number>
  setAnswers: (a: Record<string, string | number>) => void
  onSubmit: () => void
  allAnswered: boolean
}) {
  const difficultyColor = { kolay: '#10b981', orta: '#f59e0b', zor: '#ef4444' }[caseData.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: difficultyColor }} />
        <span className="text-xs capitalize font-medium" style={{ color: difficultyColor }}>
          {caseData.difficulty}
        </span>
        <span className="text-[#71717a] text-xs">•</span>
        <span className="text-[#71717a] text-xs">{caseData.category}</span>
      </div>

      <div className="p-5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div>
            <h2 className="text-[#f4f4f5] font-semibold mb-2">{caseData.title}</h2>
            <p className="text-[#71717a] text-sm leading-relaxed">{caseData.scenario}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {caseData.questions.map((q, index) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="p-5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]"
          >
            <p className="text-[#f4f4f5] text-sm font-medium mb-4">
              <span className="text-[#2563eb] mr-2">{index + 1}.</span>
              {q.question}
            </p>

            {q.type === 'multiple_choice' && q.options ? (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [q.id]: i })}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                      answers[q.id] === i
                        ? 'border-[#2563eb] bg-[#2563eb]/10 text-[#f4f4f5]'
                        : 'border-[rgba(255,255,255,0.07)] text-[#71717a] hover:text-[#f4f4f5] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#1a1a1f]'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-medium ${
                      answers[q.id] === i ? 'border-[#2563eb] bg-[#2563eb] text-white' : 'border-[rgba(255,255,255,0.2)]'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={(answers[q.id] as string) ?? ''}
                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Yanıtınızı buraya yazın..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] text-sm resize-none focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: allAnswered ? 1.02 : 1 }}
        whileTap={{ scale: allAnswered ? 0.98 : 1 }}
        onClick={onSubmit}
        disabled={!allAnswered}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <Zap className="w-4 h-4" />
        Değerlendir
      </motion.button>
    </motion.div>
  )
}

function ResultsScreen({
  evaluation, caseData, onReset,
}: {
  evaluation: Evaluation
  caseData: CaseData
  onReset: () => void
}) {
  const score = evaluation.score
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 80 ? 'Mükemmel!' : score >= 60 ? 'İyi iş!' : 'Geliştirebilirsiniz'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="p-8 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)] text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: `${scoreColor}15`, border: `2px solid ${scoreColor}30` }}
        >
          {score >= 80 ? (
            <Trophy className="w-10 h-10" style={{ color: scoreColor }} />
          ) : score >= 60 ? (
            <Star className="w-10 h-10" style={{ color: scoreColor }} />
          ) : (
            <Target className="w-10 h-10" style={{ color: scoreColor }} />
          )}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold mb-1"
          style={{ color: scoreColor }}
        >
          {score}
        </motion.p>
        <p className="text-[#f4f4f5] font-medium">{scoreLabel}</p>
        <p className="text-[#71717a] text-sm mt-2 leading-relaxed max-w-sm mx-auto">{evaluation.feedback}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {evaluation.strengths.length > 0 && (
          <div className="p-4 rounded-xl bg-[#10b981]/5 border border-[#10b981]/15">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              <p className="text-[#10b981] text-sm font-medium">Güçlü Yönler</p>
            </div>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="text-[#71717a] text-xs">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {evaluation.improvements.length > 0 && (
          <div className="p-4 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/15">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
              <p className="text-[#f59e0b] text-sm font-medium">Geliştirin</p>
            </div>
            <ul className="space-y-1.5">
              {evaluation.improvements.map((s, i) => (
                <li key={i} className="text-[#71717a] text-xs">{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[#f4f4f5] text-sm font-medium">Soru Bazlı Değerlendirme</p>
        {caseData.questions.map((q, index) => {
          const fb = evaluation.question_feedbacks.find(f => f.question_id === q.id)
          return (
            <div key={q.id} className="p-4 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
              <div className="flex items-start gap-3">
                {fb?.correct ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#ef4444] mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-[#f4f4f5] text-sm">
                    <span className="text-[#71717a] mr-1">{index + 1}.</span>{q.question}
                  </p>
                  {fb?.comment && (
                    <p className="text-[#71717a] text-xs mt-1.5">{fb.comment}</p>
                  )}
                  <div className="mt-2 p-2.5 rounded-lg bg-[#1a1a1f]">
                    <p className="text-[#71717a] text-xs">
                      <span className="text-[#10b981] font-medium">Açıklama: </span>
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Yeni Vaka
        </motion.button>
      </div>
    </motion.div>
  )
}
