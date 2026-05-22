'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Send, Loader2, Map } from 'lucide-react'
import { toast } from 'sonner'
import type { PlanStep } from '@/app/actions/plan'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface NextStepTrigger {
  completedTitle: string
  nextNumber: number
  timestamp: number
}

interface PlanChatProps {
  steps: PlanStep[]
  nextStepTrigger: NextStepTrigger | null
  onStepGenerated: (step: { title: string; description: string }) => Promise<void>
}

const STARTER_PROMPTS = [
  'Zirkonyum kron üretiminde hızlanmak istiyorum',
  'CAD/CAM sistemini daha verimli kullanmak istiyorum',
  'Müşteri memnuniyetimi artırmak istiyorum',
  'İmplant üstü protez konusunda gelişmek istiyorum',
]

function ThinkingDots() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] flex items-center justify-center shrink-0 mt-1">
        <Map className="w-3.5 h-3.5 text-[#2563eb]" />
      </div>
      <div className="bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#999999]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function PlanChat({ steps, nextStepTrigger, onStepGenerated }: PlanChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevTriggerTs = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  useEffect(() => () => abortRef.current?.abort(), [])

  // Auto-send when a step is completed
  useEffect(() => {
    if (!nextStepTrigger) return
    if (prevTriggerTs.current === nextStepTrigger.timestamp) return
    prevTriggerTs.current = nextStepTrigger.timestamp

    const autoMessage = `"${nextStepTrigger.completedTitle}" adımını tamamladım. Bir sonraki adımı oluşturabilir misin?`
    sendMessage(autoMessage)
  }, [nextStepTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null
    try {
      const res = await fetch('/api/plan-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentSteps: steps.map(s => ({ title: s.title, status: s.status })),
        }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Bağlantı hatası.' }))
        toast.error(err.error ?? 'Bir hata oluştu.')
        return
      }

      reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      let pendingStep: { title: string; description: string } | null = null

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) { toast.error(parsed.error); break }
            if (parsed.text) {
              assistantText += parsed.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: assistantText }
                return updated
              })
            }
            if (parsed.step) {
              pendingStep = parsed.step
            }
          } catch { /* JSON parse hatası */ }
        }
      }

      // Strip <plan_step>...</plan_step> from displayed message
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            content: last.content.replace(/<plan_step>[\s\S]*?<\/plan_step>/g, '').trim(),
          }
        }
        return updated
      })

      if (pendingStep) {
        await onStepGenerated(pendingStep)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      try { reader?.releaseLock() } catch { /* zaten serbest */ }
      if (abortRef.current === controller) {
        abortRef.current = null
        setIsStreaming(false)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(229,231,235,0.08)] shrink-0">
        <Map className="w-4 h-4 text-[#2563eb]" />
        <span className="text-[#ffffff] text-sm font-medium">Plan Asistanı</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] flex items-center justify-center mb-3">
              <Map className="w-6 h-6 text-[#2563eb]" />
            </div>
            <h3 className="text-[#ffffff] font-medium mb-1 text-sm">Hedefini Paylaş</h3>
            <p className="text-[#999999] text-xs max-w-[240px] mb-5 leading-relaxed">
              Ne üzerinde gelişmek istediğini anlat. Sana adım adım bir plan oluşturayım.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {STARTER_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="text-left px-3 py-2 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#999999] text-xs hover:text-[#ffffff] hover:border-[rgba(255,255,255,0.12)] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
              msg.role === 'user'
                ? 'bg-[#2563eb] text-white'
                : 'bg-[#1f1f20] border border-[rgba(229,231,235,0.08)]'
            }`}>
              {msg.role === 'user' ? 'S' : <Map className="w-3.5 h-3.5 text-[#2563eb]" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === 'user'
                ? 'bg-[#2563eb] text-white rounded-tr-sm'
                : 'bg-[#161617] border border-[rgba(229,231,235,0.08)] text-[#ffffff] rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none text-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 pl-4 list-disc space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-[#ffffff]">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-[#ffffff]">{children}</strong>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-[#ffffff]">{children}</h3>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && <ThinkingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-[rgba(229,231,235,0.08)]">
        <div className="flex gap-2.5 items-end bg-[#161617] border border-[rgba(229,231,235,0.08)] rounded-2xl px-4 py-2.5 focus-within:border-[#2563eb]/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Hedefini veya sorununu yaz..."
            rows={1}
            className="flex-1 bg-transparent text-[#ffffff] placeholder:text-[#999999] text-sm resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: '140px' }}
            disabled={isStreaming}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-[#2563eb] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isStreaming
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </motion.button>
        </div>
      </div>
    </div>
  )
}
