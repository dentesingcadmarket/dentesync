'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteCase } from '@/app/actions/cases'

export function DeleteCaseButton({ caseId }: { caseId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCase(caseId)
      if (result.error) { toast.error(result.error); return }
      toast.success('Vaka silindi.')
      router.push('/dashboard/case-management')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 text-sm hover:bg-red-500/10 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Sil
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#111114] border-[rgba(255,255,255,0.07)] text-[#f4f4f5] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#f4f4f5]">Vakayı Sil</DialogTitle>
          </DialogHeader>
          <p className="text-[#71717a] text-sm">
            Bu vaka ve tüm dosyaları kalıcı olarak silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] text-sm hover:bg-white/5 transition-colors"
            >
              İptal
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Sil
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
