import Link from 'next/link'
import Image from 'next/image'
import {
  Terminal, FolderOpen, Map, Dumbbell, Users,
  AlertTriangle, CheckCircle2, ArrowRight, Sparkles, Zap, Shield,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Terminal,
    title: 'D-Console',
    description: 'Diş teknolojisi uzmanı AI asistanınız. Protez, implant, zirkonyum sorularınıza anlık yanıt alın.',
    color: '#2563eb',
  },
  {
    icon: FolderOpen,
    title: 'Vaka Yönetimi',
    description: 'STL, PDF ve görsel dosyalarla vakalarınızı organize edin. Her şey tek yerde.',
    color: '#10b981',
  },
  {
    icon: Map,
    title: 'Planım',
    description: 'AI ile adım adım öğrenme planı oluşturun. Her adımı tamamladıkça ilerleyin.',
    color: '#8b5cf6',
  },
  {
    icon: AlertTriangle,
    title: 'Hata Analizi',
    description: 'Vakalardaki hataları AI ile analiz edin. Kök nedeni bulun, tekrarını önleyin.',
    color: '#ef4444',
  },
  {
    icon: Dumbbell,
    title: 'Vaka Pratiği',
    description: 'AI tarafından oluşturulan gerçekçi vakalarla pratik yapın. Puan alın, gelişin.',
    color: '#f59e0b',
  },
  {
    icon: Users,
    title: 'Topluluk',
    description: 'Binlerce diş teknisyeniyle bilgi paylaşın. Gerçek zamanlı etkileşim.',
    color: '#10b981',
  },
]

const PLANS = [
  {
    name: 'M1',
    label: 'Başlangıç',
    price: '$9',
    period: '/ay',
    description: 'Bireysel kullanım için temel paket',
    features: [
      'D-Console (temel)',
      'Vaka Yönetimi (sınırsız)',
      'Hata Analizi',
      'Topluluk (okuma)',
      'Haberler & Mağaza',
    ],
    cta: 'Başlayın',
    highlight: false,
  },
  {
    name: 'M2',
    label: 'Profesyonel',
    price: '$17',
    period: '/ay',
    description: 'Profesyoneller için tam erişim',
    features: [
      "M1'deki her şey",
      'Vaka Pratiği (AI)',
      'Topluluk (yazma & yorum)',
      'Gelişmiş D-Console',
      'Planım (tam erişim)',
    ],
    cta: 'Profesyonel Başlayın',
    highlight: true,
  },
  {
    name: 'M3',
    label: 'B2B',
    price: '$45',
    period: '/ay',
    description: 'Klinikler ve ekipler için',
    features: [
      "M2'deki her şey",
      'Çok kullanıcı yönetimi',
      'Öncelikli destek',
      'Özel entegrasyonlar',
      'SLA garantisi',
    ],
    cta: 'Ekibinizi Büyütün',
    highlight: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Ahmet Yılmaz',
    role: 'Diş Teknisyeni, İstanbul',
    text: 'D-Console sayesinde zirkonyum köprü hazırlık sürecimde karşılaştığım sorunları çok daha hızlı çözüyorum. Her teknisyenin kullanması gereken bir araç.',
  },
  {
    name: 'Fatma Demir',
    role: 'Protez Uzmanı, Ankara',
    text: 'Vaka Pratiği özelliği ile kendinizi sürekli test edebiliyorsunuz. AI geribildirimleri gerçekten değerli ve öğretici.',
  },
  {
    name: 'Mehmet Kaya',
    role: 'CAD/CAM Teknisyeni, İzmir',
    text: "Topluluk sayesinde Türkiye'nin dört bir yanındaki meslektaşlarımla bağlantı kuruyorum. Bilgi paylaşımı çok güçlü.",
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-[#f4f4f5] overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="DenteSync" width={32} height={32} className="rounded-lg" />
            <span className="font-semibold text-base">DenteSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors">Özellikler</a>
            <a href="#pricing" className="text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors">Fiyatlandırma</a>
            <Link href="/login" className="text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors">Giriş</Link>
          </div>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Ücretsiz Başlayın
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2563eb]/8 rounded-full blur-[120px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.07)] bg-[#111114] text-[#71717a] text-xs mb-8">
          <Sparkles className="w-3 h-3 text-[#2563eb]" />
          Diş teknisyenleri için yapay zeka platformu
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold leading-tight mb-6 tracking-tight">
          Diş teknolojisinde<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#60a5fa]">
            yapay zeka çağı
          </span>
        </h1>

        <p className="text-[#71717a] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          D-Console ile anında uzman yanıtlar alın. Vakalarınızı yönetin, hatalarınızı analiz edin,
          AI ile pratik yapın ve profesyonel topluluğa katılın.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            Hemen Başlayın
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3 rounded-full border border-[rgba(255,255,255,0.07)] text-[#71717a] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
          >
            Özellikleri Keşfet
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 justify-center mt-16 pt-16 border-t border-[rgba(255,255,255,0.05)]">
          {[
            { label: 'Aktif Teknisyen', value: '2.000+' },
            { label: 'Çözülen Vaka', value: '15.000+' },
            { label: 'Ortalama Puan', value: '4.9/5' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold text-[#f4f4f5]">{stat.value}</p>
              <p className="text-[#71717a] text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* D-Console Demo */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="p-1 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111114]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.07)]">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
            <div className="w-3 h-3 rounded-full bg-[#10b981]/60" />
            <span className="ml-2 text-[#71717a] text-xs font-mono">D-Console — DenteSync AI</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1a1a1f] border border-[rgba(255,255,255,0.07)] flex items-center justify-center shrink-0">
                <span className="text-xs text-[#71717a]">S</span>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-[#1a1a1f]">
                <p className="text-[#f4f4f5] text-sm">Zirkonyum kron için ideal duvar kalınlığı nedir? Anterior ve posterior için fark var mı?</p>
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-[#2563eb]/20 flex items-center justify-center shrink-0">
                <Terminal className="w-3.5 h-3.5 text-[#2563eb]" />
              </div>
              <div className="flex-1 p-4 rounded-xl bg-[#2563eb]/8 border border-[#2563eb]/15">
                <p className="text-[#f4f4f5] text-sm leading-relaxed">
                  Zirkonyum kronlar için ideal duvar kalınlığı, kullandığınız malzeme tipine göre değişir:<br /><br />
                  <strong className="text-[#2563eb]">Anterior (ön bölge):</strong> Estetik öncelikli olduğu için minimum <strong>0.5mm</strong> — translüsent zirkonyumda yeterli.<br /><br />
                  <strong className="text-[#2563eb]">Posterior (arka bölge):</strong> Oklüzal yük nedeniyle minimum <strong>0.8–1.0mm</strong> önerilir...
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#2563eb]" />
                  <span className="text-[#71717a] text-xs">D-Console AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">Tüm İhtiyacınız Tek Platformda</h2>
          <p className="text-[#71717a] max-w-lg mx-auto">Diş teknolojisi pratiğinizi dönüştürecek araçların tamamı bir arada.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="p-6 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.12)] transition-colors">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-[#f4f4f5] font-medium mb-2">{feature.title}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-[rgba(255,255,255,0.05)] py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: Shield, title: 'Güvenli & Şifreli', desc: 'API key\'leriniz şifreli, verileriniz Supabase\'de güvende.' },
            { icon: Zap, title: 'Gerçek Zamanlı', desc: 'Streaming AI yanıtları ve Realtime topluluk feed\'i.' },
            { icon: Sparkles, title: 'Sürekli Gelişen', desc: 'Haftalık güncellemeler ve yeni özellikler.' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#111114] border border-[rgba(255,255,255,0.07)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#2563eb]" />
                </div>
                <p className="text-[#f4f4f5] font-medium text-sm">{item.title}</p>
                <p className="text-[#71717a] text-xs">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">Şeffaf Fiyatlandırma</h2>
          <p className="text-[#71717a]">İhtiyacınıza göre plan seçin. İstediğiniz zaman değiştirin.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`p-6 rounded-2xl border flex flex-col ${
                plan.highlight
                  ? 'border-[#2563eb]/40 bg-[#2563eb]/5 ring-1 ring-[#2563eb]/20'
                  : 'border-[rgba(255,255,255,0.07)] bg-[#111114]'
              }`}
            >
              {plan.highlight && (
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#2563eb] text-white text-xs font-medium mb-3 self-start">
                  Popüler
                </div>
              )}
              <div className="mb-1">
                <span className="text-[#71717a] text-xs font-medium uppercase tracking-widest">{plan.name}</span>
                <p className="text-[#f4f4f5] font-medium mt-0.5">{plan.label}</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-[#f4f4f5]">{plan.price}</span>
                <span className="text-[#71717a] text-sm">{plan.period}</span>
              </div>
              <p className="text-[#71717a] text-xs mb-6">{plan.description}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    <span className="text-[#71717a] text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'border border-[rgba(255,255,255,0.07)] text-[#f4f4f5] hover:bg-white/5'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3">Teknisyenler Anlatıyor</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="p-6 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.07)]">
              <p className="text-[#71717a] text-sm leading-relaxed mb-4">&quot;{t.text}&quot;</p>
              <div>
                <p className="text-[#f4f4f5] text-sm font-medium">{t.name}</p>
                <p className="text-[#71717a] text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[rgba(255,255,255,0.05)] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4">Bugün Başlayın</h2>
          <p className="text-[#71717a] mb-8">Kredi kartı gerekmez. 14 gün ücretsiz deneyin.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="DenteSync" width={24} height={24} className="rounded-md" />
            <span className="text-[#71717a] text-sm">DenteSync &copy; 2025</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors">Giriş Yap</Link>
            <Link href="/signup" className="text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors">Kayıt Ol</Link>
            <Link href="/dashboard/support" className="text-[#71717a] text-sm hover:text-[#f4f4f5] transition-colors">Destek</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
