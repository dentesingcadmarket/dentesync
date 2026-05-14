'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Key, Eye, EyeOff, Loader2, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveApiKey, deleteApiKey } from '@/app/actions/api-key'

interface ApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasKey: boolean
  onKeySaved: () => void
}

export function ApiKeyModal({ open, onOpenChange, hasKey, onKeySaved }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await saveApiKey(key)
      if (result.error) { toast.error(result.error); return }
      toast.success('API key kaydedildi.')
      setKey('')
      onKeySaved()
      onOpenChange(false)
    })
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteApiKey()
      if (result.error) { toast.error(result.error); return }
      toast.success('API key silindi.')
      onKeySaved()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111114] border-[rgba(255,255,255,0.07)] text-[#f4f4f5] max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-[#2563eb]" />
            </div>
            <DialogTitle className="text-[#f4f4f5]">Anthropic API Key</DialogTitle>
          </div>
          <p className="text-[#71717a] text-sm">
            D-Console&apos;u kullanmak için kendi Anthropic API key&apos;inizi girmeniz gerekiyor.
          </p>
        </DialogHeader>

        {hasKey ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center gap-3">
              <Key className="w-4 h-4 text-[#10b981] shrink-0" />
              <div>
                <p className="text-[#10b981] text-sm font-medium">API key aktif</p>
                <p className="text-[#71717a] text-xs">sk-ant-••••••••••••••••</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:bg-white/5 transition-colors"
              >
                Kapat
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Key&apos;i Sil
              </motion.button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[#f4f4f5] text-sm">API Key</Label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="pr-10 bg-[#1a1a1f] border-[rgba(255,255,255,0.07)] text-[#f4f4f5] placeholder:text-[#71717a] rounded-xl focus:border-[#2563eb] font-mono text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#f4f4f5]"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)]">
              <p className="text-[#71717a] text-xs leading-relaxed">
                API key&apos;iniz şifreli olarak Supabase&apos;de saklanır ve yalnızca sizin isteklerinizde kullanılır.
                Anthropic hesabınızda kullanım limitlerini takip edebilirsiniz.
              </p>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#2563eb] text-xs mt-2 hover:underline"
              >
                API key almak için tıklayın <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:bg-white/5 transition-colors"
              >
                İptal
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPending || !key}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2563eb] text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Kaydet
              </motion.button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
