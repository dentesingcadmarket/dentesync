'use client'

import { useRef, useState } from 'react'
import { Loader2, Box, X, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface StlUploadProps {
  value: string | null
  filename: string | null
  onChange: (url: string | null, filename: string | null) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StlUpload({ value, filename, onChange }: StlUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.stl')) {
      toast.error('Yalnızca .stl dosyaları yüklenebilir.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('STL dosyası en fazla 50 MB olabilir.')
      return
    }

    setUploading(true)
    setFileSize(file.size)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/community/upload-stl', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Yükleme başarısız.'); return }
      onChange(data.url, data.filename || file.name)
    } finally {
      setUploading(false)
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#1f1f20] border border-[#2563eb]/30">
        <Box className="w-4 h-4 text-[#2563eb] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[#ffffff] text-xs font-medium truncate">{filename || 'model.stl'}</p>
          {fileSize && <p className="text-[#999999] text-[10px]">{formatBytes(fileSize)}</p>}
        </div>
        <button
          type="button"
          onClick={() => { onChange(null, null); setFileSize(null) }}
          className="shrink-0 text-[#999999] hover:text-anchor-graphite transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed cursor-pointer transition-colors ${
      uploading
        ? 'border-[rgba(255,255,255,0.12)] text-[#999999]'
        : 'border-[rgba(255,255,255,0.12)] text-[#999999] hover:border-[#2563eb]/50 hover:text-[#999999]'
    }`}>
      {uploading
        ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        : <Upload className="w-4 h-4 shrink-0" />
      }
      <span className="text-xs">{uploading ? 'Yükleniyor...' : '3D Model Ekle (.stl)'}</span>
      <input
        ref={inputRef}
        type="file"
        accept=".stl"
        disabled={uploading}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </label>
  )
}
