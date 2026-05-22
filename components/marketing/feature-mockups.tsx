import { Terminal, FolderOpen, AlertTriangle, CheckCircle2, Calendar, FileText } from 'lucide-react'

const SHELL_CLASS =
  'w-full max-w-[480px] rounded-2xl bg-charcoal-surface/90 border border-white/[0.10] backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden'

function MockHeader({ icon: Icon, label }: { icon: typeof Terminal; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-black/30">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
      </div>
      <div className="flex items-center gap-1.5 ml-2 text-muted-silver">
        <Icon className="w-3 h-3" strokeWidth={1.8} />
        <span className="text-[11px] font-medium tracking-tight">{label}</span>
      </div>
    </div>
  )
}

export function ConsoleMockup() {
  return (
    <div className={SHELL_CLASS}>
      <MockHeader icon={Terminal} label="D-Console" />
      <div className="p-4 space-y-3">
        {/* User bubble — right */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-md bg-morphic-blue/90 text-cloud-white text-[12px] leading-snug px-3 py-2">
            Zirkonyum kron için minimum kalınlık önerin?
          </div>
        </div>
        {/* AI bubble — left */}
        <div className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-white/[0.06] text-cloud-white/90 text-[12px] leading-snug px-3 py-2">
            Anterior bölgede <span className="text-morphic-teal">0.8 mm</span> aksiyel,
            posteriorda <span className="text-morphic-teal">1.0 mm</span> okluzal kalınlık önerilir.
          </div>
        </div>
        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="rounded-2xl bg-white/[0.04] px-3 py-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cloud-white/40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-cloud-white/40 animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-cloud-white/40 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CasesMockup() {
  const rows = [
    { id: 'A-2026-0142', name: 'Ahmet Y. — Zirkonyum köprü', status: 'Tasarımda', color: 'text-morphic-aqua bg-morphic-aqua/15', date: '12 Şub' },
    { id: 'A-2026-0141', name: 'Fatma K. — All-on-4', status: 'Frezelemede', color: 'text-amber-300 bg-amber-300/15', date: '10 Şub' },
    { id: 'A-2026-0140', name: 'Mehmet S. — Anterior kron', status: 'Tamamlandı', color: 'text-morphic-green bg-morphic-green/15', date: '08 Şub' },
  ]
  return (
    <div className={SHELL_CLASS}>
      <MockHeader icon={FolderOpen} label="Vaka Yönetimi" />
      <div className="p-3 space-y-1.5">
        {rows.map(r => (
          <div
            key={r.id}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-muted-silver" strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cloud-white text-[11.5px] font-medium leading-tight truncate">{r.name}</p>
              <p className="text-muted-silver text-[10px] leading-tight">#{r.id}</p>
            </div>
            <span className={`text-[9.5px] font-medium px-2 py-0.5 rounded-full ${r.color}`}>{r.status}</span>
            <span className="text-muted-silver text-[10px] inline-flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" strokeWidth={2} />
              {r.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ErrorsMockup() {
  const items = [
    { icon: AlertTriangle, color: 'text-amber-300', label: 'Kök neden', value: 'Marjinal uyumda 0.05 mm açıklık' },
    { icon: CheckCircle2, color: 'text-morphic-teal', label: 'Önleyici plan', value: 'Tarama dpi: 75 → 90 yükselt' },
    { icon: CheckCircle2, color: 'text-morphic-green', label: 'Öneri', value: 'CAM tool path 0.3 → 0.2 mm' },
  ]
  return (
    <div className={SHELL_CLASS}>
      <MockHeader icon={AlertTriangle} label="Hata Analizi" />
      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
          <span className="text-cloud-white text-[12px] font-semibold tracking-tight">Vaka #A-2026-0138</span>
          <span className="ml-auto text-amber-300 text-[10px] font-medium">İnceleniyor</span>
        </div>
        {items.map(it => (
          <div key={it.label} className="flex gap-2.5">
            <it.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${it.color}`} strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-muted-silver text-[9.5px] uppercase tracking-wider">{it.label}</p>
              <p className="text-cloud-white text-[11.5px] leading-snug">{it.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
