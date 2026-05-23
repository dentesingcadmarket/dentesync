import { Paperclip, Image as ImageIcon, Sliders, ArrowUp, MessageSquareText, Crosshair, History } from 'lucide-react'

/**
 * "Anything from a prompt" muadili — prompt input mockup + 3 alt-özellik.
 */
export function PromptShowcase() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05]">
          Doğal dilden plana
          <br />
          <span className="text-muted-silver">Tek bir cümleyle başla</span>
        </h2>
      </div>

      {/* Prompt input mockup */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="rounded-2xl bg-nightfall-gray/80 border border-outline-haze/[0.10] backdrop-blur-xl p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-2 px-2 py-2">
            <Paperclip className="w-3.5 h-3.5 text-muted-silver shrink-0" strokeWidth={1.8} />
            <span className="text-cloud-white text-body truncate">
              Zirkonyum köprü hazırlığı{' '}
              <span className="text-morphic-aqua">@VakaTemplate</span>
            </span>
          </div>
          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-white/[0.04]">
            <div className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-silver">
              <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span className="text-caption">STL</span>
            </div>
            <button type="button" className="p-1.5 rounded-md text-muted-silver hover:text-cloud-white" aria-label="Bağlam">
              <History className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
            <button type="button" className="p-1.5 rounded-md text-muted-silver hover:text-cloud-white" aria-label="Ayarlar">
              <Sliders className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
            <div className="flex-1" />
            <button
              type="button"
              className="w-7 h-7 rounded-full bg-morphic-blue flex items-center justify-center"
              aria-label="Gönder"
            >
              <ArrowUp className="w-3.5 h-3.5 text-cloud-white" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* 3 alt-özellik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
        {[
          {
            icon: MessageSquareText,
            title: 'Doğal dilde sor',
            desc: 'Vakanı normal cümlelerle açıkla — D-Console bağlamı anlar, sana teknik karşılığını döner.',
          },
          {
            icon: Crosshair,
            title: 'STL üzerinde işaretle',
            desc: 'Modeli yükle, problem alanını işaretle, AI o noktaya odaklanıp önerini sunar.',
          },
          {
            icon: History,
            title: 'Vaka bağlamını hatırla',
            desc: 'Her oturum vakanın tüm geçmişini bilir — önceki kararları, dosyaları ve notları.',
          },
        ].map(f => (
          <div key={f.title}>
            <div className="w-9 h-9 rounded-lg bg-morphic-teal/10 flex items-center justify-center mb-4">
              <f.icon className="w-4 h-4 text-morphic-teal" strokeWidth={1.8} />
            </div>
            <h3 className="text-cloud-white text-body-lg font-semibold tracking-tight mb-2">{f.title}</h3>
            <p className="text-muted-silver text-body leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
