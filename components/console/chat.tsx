'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Send, Loader2, Plus, Terminal, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatProps {
  initialSessionId?: string
  initialMessages?: Message[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-[#0075ff]" /> : <Copy className="w-3 h-3 text-[#999999]" />}
    </button>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-1 ${
        isUser ? 'bg-[#0075ff] text-white' : 'bg-[#292929] border border-[rgba(229,231,235,0.08)]'
      }`}>
        {isUser ? 'S' : <Terminal className="w-3.5 h-3.5 text-[#0075ff]" />}
      </div>

      {/* Mesaj */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? 'bg-[#0075ff] text-white rounded-tr-sm'
          : 'bg-[#212121] border border-[rgba(229,231,235,0.08)] text-[#ffffff] rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                const codeStr = String(children).replace(/\n$/, '')
                if (match) {
                  return (
                    <div className="relative my-2">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="!rounded-xl !text-xs"
                      >
                        {codeStr}
                      </SyntaxHighlighter>
                      <CopyButton text={codeStr} />
                    </div>
                  )
                }
                return <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs" {...props}>{children}</code>
              },
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 pl-4 space-y-1 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 pl-4 space-y-1 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="text-[#ffffff]">{children}</li>,
              h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-[#ffffff]">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-[#ffffff]">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-[#ffffff]">{children}</h3>,
              strong: ({ children }) => <strong className="font-semibold text-[#ffffff]">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-[#0075ff] pl-3 my-2 text-[#999999]">{children}</blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ThinkingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#292929] border border-[rgba(229,231,235,0.08)] flex items-center justify-center shrink-0 mt-1">
        <Terminal className="w-3.5 h-3.5 text-[#0075ff]" />
      </div>
      <div className="bg-[#212121] border border-[rgba(229,231,235,0.08)] rounded-2xl rounded-tl-sm px-4 py-3">
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
    </motion.div>
  )
}

export function Chat({ initialSessionId, initialMessages = [] }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Oturum açmanız gerekiyor.')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('console_sessions')
      .insert({ user_id: user.id, messages: [], files: [] })
      .select()
      .single()

    setSessionId(data.id)
    return data.id
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    // Textarea boyutunu sıfırla
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const sid = await ensureSession()

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId: sid }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Bağlantı hatası.' }))
        toast.error(err.error ?? 'Bir hata oluştu.')
        setIsStreaming(false)
        return
      }

      // Streaming okuma
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

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
          } catch { /* JSON parse hatası — yoksay */ }
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  function newChat() {
    setMessages([])
    setSessionId(undefined)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(229,231,235,0.08)] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0075ff]" />
          <span className="text-[#ffffff] text-sm font-medium">D-Console</span>
          {sessionId && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0075ff]/15 text-[#0075ff]">Oturum aktif</span>
          )}
        </div>
        <button
          onClick={newChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#999999] hover:text-[#ffffff] hover:bg-[#292929] text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Yeni sohbet
        </button>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#292929] border border-[rgba(229,231,235,0.08)] flex items-center justify-center mb-4">
              <Terminal className="w-7 h-7 text-[#0075ff]" />
            </div>
            <h3 className="text-[#ffffff] font-medium mb-2">D-Console&apos;a hoş geldiniz</h3>
            <p className="text-[#999999] text-sm max-w-xs">
              Diş teknisyenliği konularında sorularınızı sorun. Protez, implant, zirkonyum ve daha fazlası.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-sm">
              {[
                'Zirkonyum kron için ideal kalınlık nedir?',
                'İmplant üstü protezde vida açıklaması',
                'Metal seramik kırılmasının nedenleri',
                'CAD/CAM frezeleme hataları',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left px-3 py-2 rounded-xl bg-[#292929] border border-[rgba(229,231,235,0.08)] text-[#999999] text-xs hover:text-[#ffffff] hover:border-[rgba(255,255,255,0.12)] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <ThinkingIndicator />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0 border-t border-[rgba(229,231,235,0.08)]">
        <div className="flex gap-3 items-end bg-[#212121] border border-[rgba(229,231,235,0.08)] rounded-2xl px-4 py-3 focus-within:border-[#0075ff]/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın... (Enter gönderin, Shift+Enter satır atlar)"
            rows={1}
            className="flex-1 bg-transparent text-[#ffffff] placeholder:text-[#999999] text-sm resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: '160px' }}
            disabled={isStreaming}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-[#0075ff] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer"
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
