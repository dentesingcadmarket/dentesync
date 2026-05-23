'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Plus, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCase, updateCase } from '@/app/actions/cases'
import type { Case } from '@/lib/supabase/types'

interface CaseFormProps {
  mode: 'create' | 'edit'
  existingCase?: Case
  onSuccess?: () => void
}

export function CaseForm({ mode, existingCase, onSuccess }: CaseFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState(existingCase?.title ?? '')
  const [description, setDescription] = useState(existingCase?.description ?? '')
  const [status, setStatus] = useState(existingCase?.status ?? 'open')
  const [notes, setNotes] = useState(existingCase?.notes ?? '')
  const [tags, setTags] = useState(existingCase?.tags?.join(', ') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('title', title)
    formData.set('description', description)
    formData.set('status', status)
    formData.set('notes', notes)
    formData.set('tags', tags)

    startTransition(async () => {
      const result = mode === 'create'
        ? await createCase(formData)
        : await updateCase(existingCase!.id, formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(mode === 'create' ? 'Vaka oluşturuldu.' : 'Vaka güncellendi.')
      setOpen(false)
      onSuccess?.()

      if (mode === 'create') {
        setTitle('')
        setDescription('')
        setStatus('open')
        setNotes('')
        setTags('')
      }
    })
  }

  const inputCls = "bg-[#0a0a0a] border border-white/[0.06] text-white placeholder:text-[#737373] rounded-xl focus:border-[#2dd4bf]/60 focus:ring-2 focus:ring-[#2dd4bf]/20 transition-all"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        {mode === 'create' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-sm font-semibold hover:bg-[#5eead4] transition-colors cursor-pointer shadow-[0_0_24px_rgba(45,212,191,0.18)]"
          >
            <Plus className="w-4 h-4" />
            Yeni Vaka
          </motion.button>
        ) : (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#999999] text-sm hover:text-white hover:bg-white/[0.04] hover:border-[#2dd4bf]/30 transition-all cursor-pointer">
            <Edit2 className="w-3.5 h-3.5" />
            Düzenle
          </button>
        )}
      </SheetTrigger>

      <SheetContent className="bg-[#161617] border-l border-white/[0.06] text-white w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white text-lg">
            {mode === 'create' ? 'Yeni Vaka Oluştur' : 'Vakayı Düzenle'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-white text-sm">Başlık *</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Vaka başlığını girin"
              className={inputCls}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white text-sm">Açıklama</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Vaka hakkında kısa bir açıklama..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-white/[0.06] text-white placeholder:text-[#737373] text-sm resize-none focus:outline-none focus:border-[#2dd4bf]/60 focus:ring-2 focus:ring-[#2dd4bf]/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white text-sm">Durum</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="bg-[#0a0a0a] border-white/[0.06] text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1f1f20] border-white/[0.08]">
                <SelectItem value="open" className="text-white">Açık</SelectItem>
                <SelectItem value="in_progress" className="text-white">Devam Ediyor</SelectItem>
                <SelectItem value="completed" className="text-white">Tamamlandı</SelectItem>
                <SelectItem value="archived" className="text-white">Arşivlendi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white text-sm">Etiketler</Label>
            <Input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="kron, implant, zirkonyum (virgülle ayırın)"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white text-sm">Notlar</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ek notlar..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border border-white/[0.06] text-white placeholder:text-[#737373] text-sm resize-none focus:outline-none focus:border-[#2dd4bf]/60 focus:ring-2 focus:ring-[#2dd4bf]/20 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-full border border-white/[0.08] text-[#999999] text-sm hover:bg-white/[0.04] hover:text-white transition-colors"
            >
              İptal
            </button>
            <motion.button
              type="submit"
              disabled={isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2dd4bf] text-[#0a0a0a] text-sm font-semibold disabled:opacity-50 hover:bg-[#5eead4] transition-colors cursor-pointer"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'create' ? 'Oluştur' : 'Kaydet'}
            </motion.button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
