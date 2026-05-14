'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Terminal } from 'lucide-react'
import { Chat } from './chat'
import { ApiKeyModal } from './api-key-modal'
import type { Message } from './chat'

interface ConsoleWrapperProps {
  initialApiKey: string | null
  sessionId?: string
  initialMessages?: Message[]
}

export function ConsoleWrapper({ initialApiKey, sessionId, initialMessages }: ConsoleWrapperProps) {
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey)
  const [keyModalOpen, setKeyModalOpen] = useState(false)

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] flex items-center justify-center mx-auto mb-6">
            <Terminal className="w-8 h-8 text-[#2563eb]" />
          </div>
          <h2 className="text-xl font-semibold text-[#f4f4f5] mb-2">D-Console</h2>
          <p className="text-[#71717a] text-sm mb-8 leading-relaxed">
            D-Console&apos;u kullanmak için Anthropic API key&apos;inizi girmeniz gerekiyor.
            Key&apos;iniz şifreli olarak saklanır.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setKeyModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4" />
            API Key Gir
          </motion.button>
        </motion.div>

        <ApiKeyModal
          open={keyModalOpen}
          onOpenChange={setKeyModalOpen}
          hasKey={false}
          onKeySaved={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* API key yönetim butonu */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setKeyModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] text-[#71717a] hover:text-[#f4f4f5] text-xs transition-colors"
        >
          <Key className="w-3 h-3" />
          API Key
        </button>
      </div>

      <Chat
        apiKey={apiKey}
        initialSessionId={sessionId}
        initialMessages={initialMessages}
      />

      <ApiKeyModal
        open={keyModalOpen}
        onOpenChange={setKeyModalOpen}
        hasKey={true}
        onKeySaved={() => { setApiKey(null); setKeyModalOpen(false) }}
      />
    </div>
  )
}
