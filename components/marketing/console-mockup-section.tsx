import { Sparkles, MessageSquare, Layers, FileText, Send, Search } from 'lucide-react'
import { DentalMotif } from './dental-icons'

/**
 * "Explore with Canvas / Where ideas take shape" muadili — D-Console editör mockup'ı.
 * Sol panel: Vakalar / Sohbetler / Dosyalar sekmeleri.
 * Ana alan: D-Console sohbet UI mockup'ı.
 * Sağ üstte küçük "AI Asistan" pill (Copilot muadili).
 */
export function ConsoleMockupSection() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-12 lg:items-end">
        <div className="lg:col-span-8">
          <h2 className="text-[36px] sm:text-[52px] lg:text-[64px] font-bold tracking-tight leading-[1.04] text-left">
            D-Console ile keşfet
            <br />
            <span className="text-muted-silver">Vakalar burada şekillenir</span>
          </h2>
        </div>
        <div className="lg:col-span-4 flex lg:justify-end lg:pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-white/[0.04] border border-outline-haze/[0.08]">
            <Sparkles className="w-3.5 h-3.5 text-morphic-teal" strokeWidth={1.8} />
            <span className="text-cloud-white text-body font-medium">AI Asistan</span>
          </div>
        </div>
      </div>

      {/* Editor mockup — self-aura glow wrapper */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-x-8 -inset-y-12 -z-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(50% 60% at 30% 40%, rgba(37,99,235,0.22) 0%, transparent 65%),
              radial-gradient(60% 50% at 75% 60%, rgba(45,212,191,0.18) 0%, transparent 70%),
              radial-gradient(40% 40% at 50% 50%, rgba(20,184,166,0.10) 0%, transparent 70%)
            `,
            filter: 'blur(40px)',
          }}
        />
      <div className="relative rounded-[24px] overflow-hidden border border-outline-haze/[0.10] bg-nightfall-gray/80 backdrop-blur-xl shadow-[0_30px_120px_-20px_rgba(0,0,0,0.8),0_0_80px_-10px_rgba(45,212,191,0.18)]">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-white/[0.06] bg-black/40">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <span className="text-muted-silver text-caption">Proje</span>
            <span className="text-muted-silver/60 text-caption">/</span>
            <span className="text-cloud-white text-caption">Zirkonyum köprü #A-2026-0142</span>
          </div>
          <div className="ml-auto flex items-center gap-1 p-0.5 rounded-pill bg-white/[0.04] border border-white/[0.06]">
            <span className="px-3 py-1 rounded-pill bg-morphic-blue text-cloud-white text-caption font-medium">Sohbet</span>
            <span className="px-3 py-1 text-muted-silver text-caption">Analiz</span>
            <span className="px-3 py-1 text-muted-silver text-caption hidden sm:inline">Plan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] min-h-[420px]">
          {/* Sol panel */}
          <aside className="border-r border-white/[0.04] bg-black/20 p-3 hidden lg:block">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Search className="w-3 h-3 text-muted-silver" strokeWidth={2} />
              <span className="text-muted-silver text-[10px]">Ara…</span>
            </div>
            <div className="space-y-0.5 mb-4">
              {[
                { icon: FileText, label: 'Vakalar', active: true, count: 12 },
                { icon: MessageSquare, label: 'Sohbetler', count: 38 },
                { icon: Layers, label: 'Dosyalar', count: 24 },
              ].map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${
                    item.active ? 'bg-morphic-blue/15 text-cloud-white' : 'text-muted-silver'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span className="text-[11px] font-medium flex-1">{item.label}</span>
                  <span className="text-[9.5px] opacity-60">{item.count}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-silver text-[9.5px] uppercase tracking-wider px-2 mb-1.5">Son vakalar</p>
            <div className="space-y-0.5">
              {[
                'Zirkonyum köprü #142',
                'Anterior kron #141',
                'All-on-4 #140',
                'PFM kor metal #139',
                'Hibrid abutment #138',
              ].map(name => (
                <div key={name} className="px-2 py-1 text-[10.5px] text-cloud-white/75 hover:text-cloud-white truncate">
                  {name}
                </div>
              ))}
            </div>
          </aside>

          {/* Ana alan — sohbet */}
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-morphic-blue/90 text-cloud-white text-[12.5px] leading-snug px-3.5 py-2.5">
                Anterior bölgede 0.6mm aksiyel kalınlık yeterli mi?
              </div>
            </div>

            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-morphic-teal/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-morphic-teal" strokeWidth={1.8} />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.05] text-cloud-white/90 text-[12.5px] leading-snug px-3.5 py-2.5">
                <p className="mb-2">
                  Anterior zirkonyum için minimum güvenli kalınlık{' '}
                  <span className="text-morphic-teal font-medium">0.8 mm</span> önerilir.
                  0.6 mm değerinde:
                </p>
                <ul className="space-y-1 text-cloud-white/75">
                  <li>• Kırılma riski %20-25 artar</li>
                  <li>• Marjinal uyumda 0.05mm sapma olası</li>
                  <li>• Estetik geçirgenlik korunur ama dayanım düşer</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-morphic-teal/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-morphic-teal" strokeWidth={1.8} />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white/[0.05] px-3.5 py-2.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cloud-white/40 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-cloud-white/40 animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cloud-white/40 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>

            {/* Input bar */}
            <div className="!mt-6 flex items-center gap-2 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
                <DentalMotif motif="tooth" className="w-3.5 h-3.5 text-muted-silver" />
              </div>
              <span className="text-muted-silver text-[12px] flex-1 truncate">
                STL dosyasını yükle ve mesh kontrolü yap…
              </span>
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-morphic-blue flex items-center justify-center"
                aria-label="Gönder"
              >
                <Send className="w-3 h-3 text-cloud-white" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
