import Link from 'next/link'
import { Building2, User, GraduationCap, ArrowRight, type LucideIcon } from 'lucide-react'
import { BackgroundVisual } from './background-visual'

interface UseCase {
  id: string
  label: string
  icon: LucideIcon
  headline: string
  description: string
  bullets: string[]
  cta: { label: string; href: string }
  glow: string
}

const USE_CASES: UseCase[] = [
  {
    id: 'clinic',
    label: 'Klinik',
    icon: Building2,
    headline: 'Klinikler için merkezi vaka yönetimi',
    description:
      'Hekim-teknisyen iş akışını tek panelden koordine edin. Teslim sürelerini takip edin, AI hata analiziyle iade oranını düşürün.',
    bullets: [
      'Çok kullanıcı rol yönetimi',
      'Vaka önceliklendirme ve SLA takibi',
      'Stripe ile otomatik fatura',
    ],
    cta: { label: 'Klinik için Başla', href: '/signup?plan=m3' },
    glow: 'rgba(20, 184, 166, 0.32)',
  },
  {
    id: 'individual',
    label: 'Bireysel Teknisyen',
    icon: User,
    headline: 'Kendi pratiğini AI ile güçlendir',
    description:
      'Serbest çalışan teknisyenler için tasarlandı. Teknik sorulara anında yanıt alın, vakalarınızı düzenli tutun.',
    bullets: ['7/24 AI teknik danışman', 'Sınırsız vaka dosyası', 'Mobil uyumlu dashboard'],
    cta: { label: 'Ücretsiz Başla', href: '/signup?plan=m2' },
    glow: 'rgba(45, 212, 191, 0.32)',
  },
  {
    id: 'school',
    label: 'Eğitim Kurumu',
    icon: GraduationCap,
    headline: 'Fakülte ve kurslar için öğrenme ortamı',
    description:
      'Öğrencilere gerçek vaka deneyimi kazandırın. AI hata analizi ile anında geri bildirim, eğitmen paneli ile sınıf yönetimi.',
    bullets: [
      'Öğrenci-eğitmen rol hiyerarşisi',
      'Vaka arşivi ve örnek çalışmalar',
      'Performans takip ve raporlama',
    ],
    cta: { label: 'Kurumunuz için Demo', href: '/dashboard/support' },
    glow: 'rgba(139, 92, 246, 0.32)',
  },
]

/**
 * Morphic "Use Cases" eşdeğeri — 3'lü statik kart grid.
 * Eski UseCaseTabs'in sekme yapısı kaldırıldı.
 */
export function UseCaseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {USE_CASES.map(uc => {
        const Icon = uc.icon
        return (
          <div
            key={uc.id}
            className="flex flex-col rounded-hero overflow-hidden bg-nightfall-gray border border-outline-haze/[0.06]"
          >
            {/* Visual header — gradient placeholder (foto yok) */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <BackgroundVisual intensity="capability" glowColor={uc.glow} />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 70% 70% at 50% 40%, ${uc.glow} 0%, transparent 65%)`,
                }}
              />
              <div className="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-pill bg-ebony-canvas/70 backdrop-blur-md border border-outline-haze/[0.08] text-cloud-white text-caption font-medium tracking-widest uppercase">
                {uc.label}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-large bg-ebony-canvas/70 backdrop-blur-md border border-outline-haze/[0.08] flex items-center justify-center">
                  <Icon className="w-7 h-7 text-morphic-teal" strokeWidth={1.4} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6">
              <h3 className="text-cloud-white text-subheading font-semibold tracking-tight mb-2 leading-snug">
                {uc.headline}
              </h3>
              <p className="text-muted-silver text-body leading-snug mb-4">{uc.description}</p>
              <ul className="space-y-2 mb-6">
                {uc.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2.5">
                    <div className="mt-[7px] w-1.5 h-1.5 rounded-full bg-morphic-teal shrink-0" />
                    <span className="text-light-mist text-body leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={uc.cta.href}
                className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-buttons bg-white/[0.06] text-cloud-white text-body font-medium hover:bg-white/[0.10] transition-colors"
              >
                {uc.cta.label}
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
