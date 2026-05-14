'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  AlertTriangle,
  Loader2,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { saveErrorAnalysis } from '@/app/actions/error-analysis'

const SEVERITY_CONFIG = {
  low: { label: 'Düşük', color: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/20' },
  medium: { label: 'Orta', color: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/20' },
  high: { label: 'Yüksek', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  critical: { label: 'Kritik', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
} as const

type Severity = keyof typeof SEVERITY_CONFIG
type Stage = 'form' | 'analyzing' | 'done'

interface ErrorAnalysisFormProps {
  apiKey: string | null
  initialCaseId?: string
  initialCaseTitle?: string
  cases?: { id: string; title: string }[]
  trigger?: React.ReactNode
}

export function ErrorAnalysisForm({
  apiKey,
  initialCaseId,
  initialCaseTitle,
  cases = [],
  trigger,
}: ErrorAnalysisFormProps) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>('form')
  const [errorDescription, setErrorDescription] = useState('')
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId ?? '')
  const [analysisText, setAnalysisText] = useState('')
  const [meta, setMeta] = useState<{ severity: Severity; roadmap_impact: string } | null>(null)
  const [isSaving, startSaving] = useTransition()
  const router = useRouter()

  function reset() {
    setStage('form')
    setErrorDescription('')
    setSelectedCaseId(initialCaseId ?? '')
    setAnalysisText('')
    setMeta(null)
  }

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) setTimeout(reset, 300)
  }

  const caseTitle =
    initialCaseTitle ??
    cases.find(c => c.id === selectedCaseId)?.title

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!errorDescription.trim()) return
    if (!apiKey) { toast.error('API key bulunamadı. Lütfen önce D-Console\'da API key girin.'); return }

    setStage('analyzing')
    setAnalysisText('')
    setMeta(null)

    try {
      const res = await fetch('/api/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorDescription, apiKey, caseTitle }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Bağlantı hatası.' }))
        toast.error(err.error ?? 'Bir hata oluştu.')
        setStage('form')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let extractedMeta: { severity: Severity; roadmap_impact: string } | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) { toast.error(parsed.error); setStage('form'); return }
            if (parsed.text) {
              fullText += parsed.text
              setAnalysisText(fullText)
            }
            if (parsed.meta) {
              extractedMeta = parsed.meta as { severity: Severity; roadmap_impact: string }
            }
          } catch { /* skip */ }
        }
      }

      // Strip <analysis_meta> from display
      const cleanText = fullText.replace(/<analysis_meta>[\s\S]*?<\/analysis_meta>/g, '').trim()
      setAnalysisText(cleanText)

      const finalMeta = extractedMeta ?? { severity: 'medium' as Severity, roadmap_impact: 'Analiz tamamlandı.' }
      setMeta(finalMeta)
      setStage('done')

      // Save to DB
      startSaving(async () => {
        const result = await saveErrorAnalysis(
          errorDescription,
          cleanText,
          finalMeta.severity,
          finalMeta.roadmap_impact,
          selectedCaseId || undefined
        )
        if (result.error) { toast.error(result.error); return }
        toast.success('Analiz kaydedildi.')
        router.refresh()
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu.')
      setStage('form')
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger onClick={() => setOpen(true)}>
        {trigger ?? (
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f59e0b]/15 border border-[#f59e0b]/25 text-[#f59e0b] text-sm font-medium hover:bg-[#f59e0b]/25 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Hata Analizi Ekle
          </motion.span>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-[#111114] border-l border-[rgba(255,255,255,0.07)] text-[#f4f4f5] overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <SheetTitle className="text-[#f4f4f5]">Hata Analizi</SheetTitle>
          </div>
          <p className="text-[#71717a] text-sm">
            Hatayı açıkla, AI kök neden analizi ve çözüm önerileri sunsun.
          </p>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {/* FORM stage */}
          {stage === 'form' && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleAnalyze}
              className="space-y-5"
            >
              {/* Case selector (only if no initialCaseId and cases available) */}
              {!initialCaseId && cases.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-[#f4f4f5] text-sm">Vaka (Opsiyonel)</Label>
                  <div className="relative">
                    <select
                      value={selectedCaseId}
                      onChange={e => setSelectedCaseId(e.target.value)}
                      className="w-full bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#2563eb] pr-10"
                    >
                      <option value="">— Vaka seçin —</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Pre-filled case badge */}
              {initialCaseTitle && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)]">
                  <span className="text-[#71717a] text-xs">Vaka:</span>
                  <span className="text-[#f4f4f5] text-sm font-medium">{initialCaseTitle}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-[#f4f4f5] text-sm">Hata Açıklaması *</Label>
                <textarea
                  value={errorDescription}
                  onChange={e => setErrorDescription(e.target.value)}
                  placeholder="Ör: Zirkonyum kron fırın çıkışında çatlak oluştu. Metal altyapı üzerindeki seramik tabakası 2mm kalınlığındaydı ve pişirme sıcaklığı 960°C'ydi..."
                  rows={5}
                  required
                  className="w-full bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#2563eb] leading-relaxed transition-colors"
                />
                <p className="text-[#71717a] text-xs">
                  Ne kadar detaylı açıklarsan, AI analizi o kadar isabetli olur.
                </p>
              </div>

              {!apiKey && (
                <div className="p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-xs">
                  API key bulunamadı. D-Console&apos;dan Anthropic API key girin.
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!errorDescription.trim() || !apiKey}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#f59e0b] text-black text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Analiz Et
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* ANALYZING stage */}
          {stage === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[#f59e0b] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analiz yapılıyor...</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0b] border border-[rgba(255,255,255,0.07)] min-h-[200px]">
                <div className="prose prose-invert prose-sm max-w-none text-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[#f4f4f5]">{children}</p>,
                      h2: ({ children }) => <h2 className="text-sm font-semibold text-[#f4f4f5] mt-4 mb-2 first:mt-0">{children}</h2>,
                      ul: ({ children }) => <ul className="mb-2 pl-4 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-[#d4d4d8]">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-[#f4f4f5]">{children}</strong>,
                    }}
                  >
                    {analysisText.replace(/<analysis_meta>[\s\S]*?<\/analysis_meta>/g, '')}
                  </ReactMarkdown>
                  {analysisText && (
                    <span className="inline-block w-0.5 h-4 bg-[#f59e0b] animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* DONE stage */}
          {stage === 'done' && meta && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Severity + roadmap */}
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${SEVERITY_CONFIG[meta.severity].color}`}>
                  {SEVERITY_CONFIG[meta.severity].label} Önem
                </span>
                {isSaving ? (
                  <span className="text-[#71717a] text-xs flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Kaydediliyor...
                  </span>
                ) : (
                  <span className="text-[#10b981] text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Kaydedildi
                  </span>
                )}
              </div>

              {meta.roadmap_impact && (
                <div className="p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                  <p className="text-[#71717a] text-[10px] uppercase tracking-wider mb-1">Üretim Etkisi</p>
                  <p className="text-[#f4f4f5] text-sm">{meta.roadmap_impact}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#0a0a0b] border border-[rgba(255,255,255,0.07)] max-h-[420px] overflow-y-auto">
                <div className="prose prose-invert prose-sm max-w-none text-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-[#f4f4f5]">{children}</p>,
                      h2: ({ children }) => <h2 className="text-sm font-semibold text-[#f4f4f5] mt-4 mb-2 first:mt-0">{children}</h2>,
                      ul: ({ children }) => <ul className="mb-2 pl-4 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-[#d4d4d8]">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-[#f4f4f5]">{children}</strong>,
                    }}
                  >
                    {analysisText}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { reset() }}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:bg-white/5 transition-colors"
                >
                  Yeni Analiz
                </button>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 px-4 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
