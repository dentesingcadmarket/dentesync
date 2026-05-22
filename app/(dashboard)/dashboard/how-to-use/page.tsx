import { BookOpen, Terminal, FolderOpen, Map, Dumbbell, Users, AlertTriangle, Key, CheckCircle2, ShoppingBag } from 'lucide-react'

const GUIDES = [
  {
    icon: Key,
    title: 'API Key Kurulumu',
    color: '#999999',
    steps: [
      'console.anthropic.com adresine gidin ve hesap oluşturun.',
      'Settings > API Keys menüsünden yeni bir key oluşturun.',
      'D-Console sayfasında sağ üstteki anahtar ikonuna tıklayın.',
      'API key\'inizi girin ve kaydedin. Key şifreli olarak saklanır.',
    ],
  },
  {
    icon: Terminal,
    title: 'D-Console Kullanımı',
    color: '#2563eb',
    steps: [
      'Sol menüden "D-Console" seçeneğine tıklayın.',
      'Diş teknolojisi ile ilgili sorularınızı yazın.',
      'AI protez, kron, implant ve CAD/CAM konularında yanıt üretir.',
      'Konuşma geçmişiniz otomatik kaydedilir.',
    ],
  },
  {
    icon: FolderOpen,
    title: 'Vaka Yönetimi',
    color: '#2563eb',
    steps: [
      '"Tüm Vakalar" sayfasından yeni vaka oluşturun.',
      'STL (max 50MB), PDF, PNG ve DOCX dosyaları yükleyebilirsiniz.',
      'Vakaya notlar, etiketler ve durum ekleyin.',
      'Her vaka için Hata Analizi yapabilirsiniz.',
    ],
  },
  {
    icon: Map,
    title: 'Planım Özelliği',
    color: '#2563eb',
    steps: [
      '"Planım" sayfasına gidin ve hedeflerinizi yazın.',
      'AI ile sohbet ederek adım adım plan oluşturun.',
      'Her adımı tamamladığınızda AI bir sonraki adımı üretir.',
      'Plan ilerlemeniz gerçek zamanlı kaydedilir.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Hata Analizi',
    color: '#525252',
    steps: [
      'Vaka detay sayfasından "Hata Analizi Ekle" butonuna tıklayın.',
      'Karşılaştığınız sorunu detaylıca açıklayın.',
      'Şiddet seviyesini seçin: Düşük / Orta / Yüksek / Kritik.',
      'AI analizi ve yol haritası etkisini inceleyip kaydedin.',
    ],
  },
  {
    icon: Dumbbell,
    title: 'Vaka Pratiği (M2+)',
    color: '#999999',
    steps: [
      '"Vaka Pratiği" sayfasında zorluk ve konu seçin.',
      '"Vaka Oluştur" butonuna tıklayın — AI senaryo üretir.',
      'Soruları okuyun ve yanıtlarınızı girin.',
      '"Değerlendir" ile AI 0-100 puan verir ve geri bildirim sunar.',
    ],
  },
  {
    icon: Users,
    title: 'Topluluk (M2+)',
    color: '#2563eb',
    steps: [
      '"Topluluk" sayfasında diğer teknisyenlerin paylaşımlarını görün.',
      'M2+ plan ile gönderi paylaşabilir ve yorum yazabilirsiniz.',
      'Görsel ekleyebilir, gönderileri beğenebilirsiniz.',
      'Yeni gönderiler gerçek zamanlı olarak feed\'e eklenir.',
    ],
  },
  {
    icon: ShoppingBag,
    title: 'Mağaza',
    color: '#2563eb',
    steps: [
      '"Mağaza" sayfasından ürünlere göz atın.',
      'Kategoriye göre filtreleyin.',
      'Ürünü sepete ekleyin, miktarı ayarlayın.',
      '"Ödemeye Geç" ile Stripe güvenli ödeme sayfasına yönlendirilirsiniz.',
    ],
  },
]

export default function HowToUsePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#2563eb]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#ffffff]">Nasıl Kullanılır</h1>
          <p className="text-[#999999] text-sm">DenteSync özelliklerinin adım adım kılavuzu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GUIDES.map((guide) => {
          const Icon = guide.icon
          return (
            <div
              key={guide.title}
              className="p-5 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${guide.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: guide.color }} />
                </div>
                <h2 className="text-[#ffffff] font-medium text-sm">{guide.title}</h2>
              </div>
              <ol className="space-y-2.5">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: guide.color }} />
                    <span className="text-[#999999] text-xs leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>

      <div className="p-5 rounded-xl bg-[#2563eb]/5 border border-[#2563eb]/15">
        <p className="text-[#ffffff] text-sm font-medium mb-1">Hâlâ sorunuz mu var?</p>
        <p className="text-[#999999] text-xs">
          Destek sayfasından bize ulaşabilir veya toplulukta soru sorabilirsiniz (M2+).
        </p>
      </div>
    </div>
  )
}
