'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image as ImageIcon, Box, Trash2, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadCaseFile, deleteCaseFile, getSignedUrl } from '@/app/actions/cases'
import type { CaseAttachment } from '@/app/actions/cases'

const ACCEPTED_TYPES = ['.stl', '.pdf', '.png', '.jpg', '.jpeg', '.docx']
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type: string }) {
  if (type === 'stl' || type.includes('octet')) return <Box className="w-4 h-4 text-[#2563eb]" />
  if (type.includes('image')) return <ImageIcon className="w-4 h-4 text-[#10b981]" />
  return <FileText className="w-4 h-4 text-[#f59e0b]" />
}

interface FileUploaderProps {
  caseId: string
  attachments: CaseAttachment[]
}

export function FileUploader({ caseId, attachments: initialAttachments }: FileUploaderProps) {
  const [attachments, setAttachments] = useState<CaseAttachment[]>(initialAttachments)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validateFile(file: File): string | null {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_TYPES.includes(ext)) return `Desteklenmeyen dosya tipi. Kabul edilen: ${ACCEPTED_TYPES.join(', ')}`
    const isSTL = ext === '.stl'
    const maxMB = isSTL ? 50 : 5
    if (file.size > maxMB * 1024 * 1024) return `${isSTL ? 'STL' : 'Dosya'} maksimum ${maxMB}MB olabilir.`
    return null
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArr = Array.from(files)
    for (const file of fileArr) {
      const err = validateFile(file)
      if (err) { toast.error(err); continue }

      setUploading(true)
      const result = await uploadCaseFile(caseId, file)
      setUploading(false)

      if (result.error) { toast.error(result.error); continue }
      if (result.attachment) {
        setAttachments(prev => [...prev, result.attachment!])
        toast.success(`${file.name} yüklendi.`)
      }
    }
  }

  async function handleDelete(filePath: string) {
    setDeletingPath(filePath)
    const result = await deleteCaseFile(caseId, filePath)
    setDeletingPath(null)
    if (result.error) { toast.error(result.error); return }
    setAttachments(prev => prev.filter(a => a.path !== filePath))
    toast.success('Dosya silindi.')
  }

  async function handleDownload(filePath: string, name: string) {
    const result = await getSignedUrl(filePath)
    if (result.error) { toast.error(result.error); return }
    const a = document.createElement('a')
    a.href = result.url!
    a.download = name
    a.click()
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-[#2563eb] bg-[#2563eb]/5'
            : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#2563eb] animate-spin" />
            <p className="text-[#71717a] text-sm">Yükleniyor...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-[#71717a]" />
            <p className="text-[#f4f4f5] text-sm font-medium">Dosyaları sürükle veya tıkla</p>
            <p className="text-[#71717a] text-xs">STL (50MB), PDF/PNG/JPG/DOCX (5MB)</p>
          </div>
        )}
      </div>

      {/* Dosya listesi */}
      <AnimatePresence>
        {attachments.map(att => (
          <motion.div
            key={att.path}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)]"
          >
            <FileIcon type={att.type} />
            <div className="flex-1 min-w-0">
              <p className="text-[#f4f4f5] text-sm truncate">{att.name}</p>
              <p className="text-[#71717a] text-xs">{formatBytes(att.size)}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDownload(att.path, att.name)}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/10 transition-colors"
                title="İndir"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(att.path)}
                disabled={deletingPath === att.path}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                title="Sil"
              >
                {deletingPath === att.path
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {attachments.length === 0 && !uploading && (
        <p className="text-center text-[#71717a] text-xs py-2">Henüz dosya yüklenmedi.</p>
      )}
    </div>
  )
}
