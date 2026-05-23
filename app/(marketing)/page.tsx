import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ArrowUpRight,
  Shield,
  Zap,
  Quote,
  Globe,
} from 'lucide-react'

import { BackgroundVisual } from '@/components/marketing/background-visual'
import { FeatureGrid } from '@/components/marketing/feature-grid'
import { CapabilitiesBlocks } from '@/components/marketing/capabilities-blocks'
import { UseCaseGrid } from '@/components/marketing/use-case-grid'
import { type WorkflowItem } from '@/components/marketing/workflow-card'
import { WorkflowScroller } from '@/components/marketing/workflow-scroller'
import { type ShowcaseItem } from '@/components/marketing/showcase-card'
import { ShowcaseFan } from '@/components/marketing/showcase-fan'
import {
  ScrollGallery,
  type GalleryTile,
} from '@/components/marketing/scroll-gallery'
import { PricingSection } from '@/components/marketing/pricing-section'
import { SectionReveal } from '@/components/marketing/section-reveal'
import { ConsoleMockupSection } from '@/components/marketing/console-mockup-section'
import { PromptShowcase } from '@/components/marketing/prompt-showcase'
import { PossibilitiesScroller } from '@/components/marketing/possibilities-scroller'
import { CasesGridMockup } from '@/components/marketing/cases-grid-mockup'

// =====================================================================
// DATA — workflow grid (12 diş teknolojisi başlığı, foto yok → gradient + motif)
// =====================================================================
const WORKFLOWS: WorkflowItem[] = [
  { slug: 'zirkonyum-kopru', title: 'Zirkonyum köprü hazırlığı', description: 'Çapraz okluzyon ve marjinal uyum', hue: 200, motif: 'bridge', href: '/dashboard/how-to-use#zirkonyum-kopru' },
  { slug: 'anterior-kron', title: 'Anterior kron estetiği', description: 'Doğal şeffaflık ve renk geçişi', hue: 25, motif: 'crown', href: '/dashboard/how-to-use#anterior-kron' },
  { slug: 'implant-ust-yapi', title: 'İmplant üst yapı', description: 'Açı düzeltme, abutment seçimi', hue: 280, motif: 'implant', href: '/dashboard/how-to-use#implant-ust-yapi' },
  { slug: 'pfm-kor-metal', title: 'PFM kor metal işlemi', description: 'Metal alaşım ve seramik bağı', hue: 45, motif: 'crown', href: '/dashboard/how-to-use#pfm-kor-metal' },
  { slug: 'kabuk-veneer', title: 'Kabuk veneer hazırlığı', description: 'İnce kesim, minimal preparasyon', hue: 320, motif: 'tooth', href: '/dashboard/how-to-use#kabuk-veneer' },
  { slug: 'tam-protez', title: 'Tam protez set-up', description: 'Diş dizimi ve okluzal denge', hue: 140, motif: 'denture', href: '/dashboard/how-to-use#tam-protez' },
  { slug: 'bolumsel-protez', title: 'Bölümsel protez tasarımı', description: 'Klipler, konektörler, retansiyon', hue: 90, motif: 'denture', href: '/dashboard/how-to-use#bolumsel-protez' },
  { slug: 'inlay-onlay', title: 'Inlay / onlay kavite', description: 'Kavite tasarımı ve adezyon', hue: 0, motif: 'molar', href: '/dashboard/how-to-use#inlay-onlay' },
  { slug: 'hibrid-abutment', title: 'Hibrid abutment', description: 'Ti-base ve seramik geçiş', hue: 230, motif: 'implant', href: '/dashboard/how-to-use#hibrid-abutment' },
  { slug: 'all-on-4', title: 'All-on-4 tasarımı', description: 'Tam çene implant rehberi', hue: 350, motif: 'implant', href: '/dashboard/how-to-use#all-on-4' },
  { slug: 'stl-analiz', title: 'STL dosya analizi', description: 'Mesh kontrol ve hata tespiti', hue: 180, motif: 'tooth', href: '/dashboard/how-to-use#stl-analiz' },
  { slug: 'cad-cam', title: 'CAD/CAM workflow', description: 'Tasarımdan frezelemeye akış', hue: 60, motif: 'crown', href: '/dashboard/how-to-use#cad-cam' },
]

// "Yapılan Çalışmalar" galerisi — bento (variable width fixed height) + dental motif + rainbow hue
const GALLERY_TILES: GalleryTile[] = [
  { slug: 'g-zirkonyum', title: 'Zirkonyum köprü vakası', hue: 200, width: 210, motif: 'bridge', href: '/dashboard/community' },
  { slug: 'g-anterior', title: 'Anterior estetik kron', hue: 25, width: 270, motif: 'crown', href: '/dashboard/community' },
  { slug: 'g-implant', title: 'Implant üst yapı', hue: 280, width: 240, motif: 'implant', href: '/dashboard/community' },
  { slug: 'g-pfm', title: 'PFM kor metal', hue: 45, width: 180, motif: 'crown', href: '/dashboard/community' },
  { slug: 'g-veneer', title: 'Kabuk veneer', hue: 320, width: 180, motif: 'tooth', href: '/dashboard/community' },
  { slug: 'g-protez', title: 'Tam protez kurulumu', hue: 165, width: 240, motif: 'denture', href: '/dashboard/community' },
  { slug: 'g-bolumsel', title: 'Bölümsel protez', hue: 95, width: 270, motif: 'denture', href: '/dashboard/community' },
  { slug: 'g-inlay', title: 'Inlay restorasyon', hue: 350, width: 210, motif: 'molar', href: '/dashboard/community' },
  { slug: 'g-hibrid', title: 'Hibrid abutment', hue: 220, width: 210, motif: 'implant', href: '/dashboard/community' },
  { slug: 'g-allon4', title: 'All-on-4 vaka', hue: 5, width: 270, motif: 'implant', href: '/dashboard/community' },
  { slug: 'g-stl', title: 'STL dosya analizi', hue: 180, width: 240, motif: 'tooth', href: '/dashboard/community' },
  { slug: 'g-cadcam', title: 'CAD/CAM workflow', hue: 290, width: 180, motif: 'molar', href: '/dashboard/community' },
  { slug: 'g-sinter', title: 'Sinterleme prosedürü', hue: 55, width: 180, motif: 'crown', href: '/dashboard/community' },
  { slug: 'g-glazur', title: 'Glazür uygulaması', hue: 305, width: 240, motif: 'tooth', href: '/dashboard/community' },
  { slug: 'g-renk', title: 'Renk eşleştirme', hue: 145, width: 270, motif: 'molar', href: '/dashboard/community' },
  { slug: 'g-monolitik', title: 'Monolitik zirkonyum', hue: 15, width: 210, motif: 'crown', href: '/dashboard/community' },
  { slug: 'g-temporary', title: 'Geçici restorasyon', hue: 250, width: 210, motif: 'bridge', href: '/dashboard/community' },
  { slug: 'g-emaks', title: 'E-max press tekniği', hue: 195, width: 270, motif: 'denture', href: '/dashboard/community' },
]

const SHOWCASE: ShowcaseItem[] = [
  {
    slug: 'klinik-istanbul',
    subtitle: 'Klinik dönüşümü',
    title: 'İstanbul kliniği vaka süresini %42 düşürdü',
    description: '12 teknisyen, 3 hekim. DenteSync ile haftalık 200+ vaka sorunsuz koordine ediliyor.',
    href: '/dashboard/news',
    motif: 'crown',
  },
  {
    slug: 'lab-ankara',
    subtitle: 'Laboratuvar verimliliği',
    title: 'Ankara laboratuvarı haftalık 30 vaka daha çıkardı',
    description: "STL analiz ve hata önleme sayesinde yeniden yapım oranı %0'a yaklaştı.",
    href: '/dashboard/news',
    motif: 'bridge',
  },
  {
    slug: 'okul-izmir',
    subtitle: 'Akademik kullanım',
    title: 'İzmir teknisyenlik okulu AI ile sınıf yönetimi',
    description: '60 öğrenci, gerçek vakalar üzerinde pratik yapıyor.',
    href: '/dashboard/news',
    motif: 'molar',
  },
  {
    slug: 'bireysel-bursa',
    subtitle: 'Bireysel teknisyen',
    title: 'Bursa teknisyeni evden 50+ vaka yönetiyor',
    description: 'Ofis masrafı sıfır, müşteri memnuniyeti maksimum.',
    href: '/dashboard/news',
    motif: 'implant',
  },
]

const TEAM_AVATARS = [
  { name: 'Ayşe', initials: 'A' },
  { name: 'Mehmet', initials: 'M' },
  { name: 'Zeynep', initials: 'Z' },
]

const SOCIAL_LINKS = [
  { label: 'X', href: '#' },
  { label: 'in', href: '#' },
  { label: 'IG', href: '#' },
]

// =====================================================================
// PAGE
// =====================================================================
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ebony-canvas text-cloud-white overflow-x-hidden font-sans">
      {/* ================================================ */}
      {/* ÜST-ALAN GLOW WRAPPER — banner + nav + hero'yu kapsar */}
      {/* ================================================ */}
      <div className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[1100px] pointer-events-none"
          style={{
            background: `
              radial-gradient(80% 60% at 50% 35%, rgba(45,212,191,0.18) 0%, transparent 60%),
              radial-gradient(60% 50% at 70% 20%, rgba(37,99,235,0.10) 0%, transparent 65%),
              radial-gradient(50% 40% at 30% 50%, rgba(45,212,191,0.08) 0%, transparent 65%)
            `,
          }}
        />

      {/* ================================================ */}
      {/* 1. NAV (üst announcement banner Morphic'te yok — kaldırıldı, */}
      {/*        duyuru hero içindeki pill'de zaten var) */}
      {/* ================================================ */}
      <nav className="sticky top-0 z-50 bg-ebony-canvas/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="DenteSync" width={28} height={28} className="rounded-md" />
            <span className="font-semibold text-body-lg tracking-tight">DenteSync</span>
          </div>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-7">
            <a href="#features" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Özellikler</a>
            <a href="#workflows" className="text-muted-silver text-body hover:text-cloud-white transition-colors">{"Workflow'lar"}</a>
            <a href="#use-cases" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Kullanım</a>
            <a href="#pricing" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Fiyatlandırma</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex items-center px-3 py-2 rounded-pill text-cloud-white text-body hover:bg-white/[0.06] transition-colors">
              Giriş
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-morphic-blue text-cloud-white text-body font-medium hover:bg-morphic-blue-hover transition-colors cursor-pointer"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* ================================================ */}
      {/* 2. HERO — Morphic: iki-kolon asimetrik */}
      {/* ================================================ */}
      <section className="relative">
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 sm:pt-28 pb-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 lg:items-end">
            {/* SOL: pill badge + büyük başlık, sola yaslı */}
            <div className="lg:col-span-7">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-pill bg-white/[0.04] border border-outline-haze/[0.08] text-caption hover:bg-white/[0.08] transition-colors"
              >
                <span className="text-morphic-green font-semibold">YENİ</span>
                <span aria-hidden="true" className="h-3 w-px bg-white/15" />
                <span className="text-cloud-white/85">D-Console 2.0 tüm planlarda</span>
                <ArrowRight className="w-3 h-3 text-cloud-white/60" />
              </Link>
              <h1 className="text-[40px] sm:text-[64px] lg:text-display font-bold tracking-tight leading-[1.04] text-left">
                Akıllı diş laboratuvarı
                <br />
                <span className="text-muted-silver">Her teknisyen için</span>
              </h1>
            </div>

            {/* SAĞ: kısa açıklama + 2 CTA — alta yapışır (Morphic gibi) */}
            <div className="lg:col-span-5 lg:pb-3 lg:h-full flex flex-col lg:justify-end">
              <p className="text-cloud-white/85 text-body-lg leading-relaxed max-w-md">
                DenteSync, zirkonyum köprüden implant vakasına her işi hızlandırır.
                Gerçek zamanlı AI rehberlik, merkezi vaka takibi ve hata analizi
                — tek platformda.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-5 py-2.5 rounded-pill bg-morphic-blue text-cloud-white text-body font-medium hover:bg-morphic-blue-hover transition-colors cursor-pointer"
                >
                  Ücretsiz Başla
                </Link>
                <Link
                  href="/dashboard/support"
                  className="inline-flex items-center px-5 py-2.5 rounded-pill bg-white/[0.06] text-cloud-white text-body font-medium hover:bg-white/[0.10] transition-colors cursor-pointer"
                >
                  Demo iste
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pb-6">
          <ScrollGallery
            tiles={GALLERY_TILES}
            rows={2}
            headerTitle="DenteSync ile yapıldı"
            headerLogoSrc="/logo.png"
            seeMoreHref="/dashboard/community"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-16">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="flex -space-x-2 shrink-0">
              {['A', 'F', 'M'].map((initial, i) => (
                <div
                  key={initial}
                  className="w-7 h-7 rounded-full border-2 border-ebony-canvas bg-charcoal-surface text-cloud-white text-caption font-semibold flex items-center justify-center"
                  style={{ zIndex: 3 - i }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-muted-silver text-body leading-snug">
              <span className="text-cloud-white">
                &quot;D-Console gerçekten zirkonyum hazırlık sürecimi dönüştürdü.&quot;
              </span>{' '}
              — Ahmet Y., Diş Teknisyeni
            </p>
          </div>
        </div>
      </section>
      </div>
      {/* ÜST-ALAN GLOW WRAPPER kapanış */}

      {/* ================================================ */}
      {/* 2b. CONSOLE MOCKUP — "D-Console ile keşfet" */}
      {/* ================================================ */}
      <SectionReveal>
        <ConsoleMockupSection />
      </SectionReveal>

      {/* ================================================ */}
      {/* 3. PLATFORM FEATURES — 3'lü statik grid */}
      {/* ================================================ */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24">
        <SectionReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-ebony-canvas text-muted-silver text-caption mb-5">
              PLATFORM
            </div>
            <h2 className="text-[32px] sm:text-heading-lg font-bold tracking-tight mb-3">
              Fikirden teslimata tek akış
            </h2>
            <p className="text-muted-silver text-body-lg max-w-2xl mx-auto">
              D-Console, vaka yönetimi ve hata analizi — diş laboratuvarınızın üç temel aracı,
              tek panelde birleşik.
            </p>
          </div>
          <FeatureGrid />
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 3b. PROMPT SHOWCASE — "Doğal dilden plana" */}
      {/* ================================================ */}
      <SectionReveal>
        <PromptShowcase />
      </SectionReveal>

      {/* ================================================ */}
      {/* 4. WORKFLOWS */}
      {/* ================================================ */}
      <section id="workflows" className="relative py-24">
        <SectionReveal>
          <WorkflowScroller items={WORKFLOWS} seeMoreHref="/dashboard/how-to-use" />
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 4b. POSSIBILITIES SCROLLER — "Sınırsız olanaklar" */}
      {/* ================================================ */}
      <SectionReveal>
        <PossibilitiesScroller />
      </SectionReveal>

      {/* ================================================ */}
      {/* 5. CAPABILITIES — 7 alternatifli blok */}
      {/* ================================================ */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <SectionReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-ebony-canvas text-muted-silver text-caption mb-5">
              YETENEKLER
            </div>
            <h2 className="text-[32px] sm:text-heading-lg font-bold tracking-tight mb-3">
              Sınırsız olanaklar, kesintisiz akış
            </h2>
            <p className="text-muted-silver text-body-lg max-w-2xl mx-auto">
              Her vaka türüne uyum sağlayan AI yetenekleri — anlık teknik danışmanlıktan STL
              görsel analizine, hata kök neden tespitinden adım adım iş planlamasına kadar.
            </p>
          </div>
        </SectionReveal>
        <CapabilitiesBlocks />
      </section>

      {/* ================================================ */}
      {/* 6. TEAM COLLABORATION */}
      {/* ================================================ */}
      <section className="relative">
        <BackgroundVisual intensity="cta" glowColor="rgba(20, 184, 166, 0.15)" />
        <SectionReveal className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-ebony-canvas/60 backdrop-blur-md text-muted-silver text-caption mb-6">
            EKİP
          </div>
          <h2 className="text-[32px] sm:text-heading-lg font-bold tracking-tight mb-4 leading-[1.1]">
            Ekipler için tasarlandı
          </h2>
          <p className="text-muted-silver text-body-lg mb-8 leading-relaxed">
            Ekip üyelerinizi davet edin, birlikte vaka oluşturun, fikir alışverişi yapın
            ve tüm projeler, dosyalar ve çalışma alanı boyunca aynı sayfada kalın.
          </p>

          <div className="flex items-center justify-center -space-x-3 mb-8">
            {TEAM_AVATARS.map((a, i) => (
              <div
                key={a.name}
                className="w-12 h-12 rounded-full border-2 border-ebony-canvas bg-charcoal-surface text-cloud-white text-body font-semibold flex items-center justify-center"
                style={{ zIndex: TEAM_AVATARS.length - i }}
                title={a.name}
              >
                {a.initials}
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-2 border-ebony-canvas bg-morphic-teal/15 text-morphic-teal text-caption font-semibold flex items-center justify-center">
              +12
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-buttons bg-morphic-blue text-cloud-white text-body font-medium hover:bg-morphic-blue-hover transition-colors cursor-pointer"
            >
              Ücretsiz Başla
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center px-5 py-2.5 rounded-pill bg-white/[0.06] text-light-mist text-body font-medium hover:bg-white/[0.10] transition-colors cursor-pointer"
            >
              Fiyatları gör
            </a>
          </div>
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 6b. CASES GRID MOCKUP — "Hız her vakada" */}
      {/* ================================================ */}
      <SectionReveal>
        <CasesGridMockup />
      </SectionReveal>

      {/* ================================================ */}
      {/* 7. USE CASES — 3'lü statik grid */}
      {/* ================================================ */}
      <section id="use-cases" className="relative max-w-7xl mx-auto px-6 py-24">
        <SectionReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-ebony-canvas text-muted-silver text-caption mb-5">
              KULLANIM SENARYOLARI
            </div>
            <h2 className="text-[32px] sm:text-heading-lg font-bold tracking-tight mb-3 max-w-2xl mx-auto leading-[1.1]">
              Her ölçeğe uyarlanan AI altyapısı
            </h2>
            <p className="text-muted-silver text-body-lg max-w-2xl mx-auto">
              Tek başına çalışan serbest teknisyenden çok şubeli kliniklere, diş hekimliği
              fakültelerine kadar — DenteSync her ortama uyum sağlar.
            </p>
          </div>
          <UseCaseGrid />
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 8. SOCIAL PROOF */}
      {/* ================================================ */}
      <section className="relative">
        <SectionReveal className="max-w-4xl mx-auto px-6 py-24 text-center">
          <Quote className="w-8 h-8 text-morphic-teal mx-auto mb-6" strokeWidth={1.5} />
          <p className="text-cloud-white text-[24px] sm:text-[32px] font-medium tracking-tight leading-[1.25] mb-6 max-w-3xl mx-auto">
            &quot;DenteSync, AI ile diş teknolojisi pratiğinin geleceğine öncülük ediyor.&quot;
          </p>
          <p className="text-muted-silver text-body mb-12">
            — Türkiye Diş Teknisyenleri Derneği
          </p>

          <p className="text-muted-silver text-caption tracking-widest uppercase mb-6">
            Üye olduğumuz birlikler
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {['TDB', 'TURKLAB', 'IADR', 'FDI'].map(name => (
              <div
                key={name}
                className="h-14 rounded-cards bg-white/[0.04] border border-outline-haze/[0.06] flex items-center justify-center text-muted-silver text-body font-semibold tracking-widest"
              >
                {name}
              </div>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 9. SHOWCASE */}
      {/* ================================================ */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden">
        <SectionReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-1.5 mb-3 text-muted-silver text-caption">
                <Zap className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span className="tracking-wide">Bizden</span>
              </div>
              <h2 className="text-cloud-white text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05]">
                {"DenteSync'le çalışanlar"}
              </h2>
              <h2 className="text-muted-silver text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05]">
                İlham almak için
              </h2>
            </div>
            <Link
              href="/dashboard/news"
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-pill bg-charcoal-surface/80 border border-outline-haze/[0.08] text-cloud-white text-body font-medium hover:bg-charcoal-surface transition-colors shrink-0 self-start lg:self-end"
            >
              Hepsini gör
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </Link>
          </div>

          <ShowcaseFan items={SHOWCASE} />
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 9b. PRICING */}
      {/* ================================================ */}
      <SectionReveal>
        <PricingSection />
      </SectionReveal>

      {/* ================================================ */}
      {/* 10. FINAL CTA — Morphic: ortalı + timeline scrubber */}
      {/* ================================================ */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <SectionReveal>
          <div className="relative overflow-hidden rounded-hero border border-outline-haze/[0.06]">
            <BackgroundVisual intensity="cta" glowColor="rgba(20, 184, 166, 0.25)" />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none animate-mesh-drift"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 30% 40%, rgba(20,184,166,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 75% 70%, rgba(45,212,191,0.16) 0%, transparent 55%)',
              }}
            />
            <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 sm:py-28">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-outline-haze/[0.08] bg-ebony-canvas/60 backdrop-blur-md text-muted-silver text-caption mb-6">
                BAŞLAYIN
              </div>
              <h2 className="text-[34px] sm:text-[52px] font-bold tracking-tight leading-[1.08] mb-5 max-w-2xl">
                Pratiğinizi bugün dönüştürün
              </h2>
              <p className="text-muted-silver text-body-lg mb-8 max-w-lg">
                Kurulum yok, teknik bilgi gerekmez. Diş teknolojisinin geleceğine bugün katılın.
                14 gün boyunca kredi kartı olmadan deneyin.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-buttons bg-morphic-blue text-cloud-white text-body font-medium hover:bg-morphic-blue-hover transition-colors cursor-pointer"
                >
                  Hemen Başla
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard/support"
                  className="inline-flex items-center px-5 py-2.5 rounded-pill bg-white/[0.06] text-light-mist text-body font-medium hover:bg-white/[0.10] transition-colors cursor-pointer"
                >
                  Demo iste
                </Link>
              </div>

              {/* Timeline scrubber — Morphic'in video-editör scrubber'ının yapısal karşılığı */}
              <div className="mt-14 w-full max-w-xl">
                <div className="flex items-center justify-between text-caption text-muted-silver mb-2 font-soehne-mono">
                  <span>0:00</span>
                  <span className="text-cloud-white/70">Vaka akışı</span>
                  <span>0:15</span>
                </div>
                <div className="relative h-1.5 rounded-pill bg-white/[0.08]">
                  <div className="absolute inset-y-0 left-0 w-[42%] rounded-pill bg-gradient-to-r from-morphic-teal to-morphic-aqua" />
                  <div className="absolute top-1/2 left-[42%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-pill bg-cloud-white border-2 border-morphic-teal shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
                </div>
                <div className="flex justify-between mt-2">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-px ${i % 4 === 0 ? 'h-2 bg-white/25' : 'h-1.5 bg-white/12'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ================================================ */}
      {/* 11. FOOTER */}
      {/* ================================================ */}
      <footer className="relative border-t border-outline-haze/[0.06] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="DenteSync" width={24} height={24} className="rounded-md" />
                <span className="font-semibold text-body-lg tracking-tight">DenteSync</span>
              </div>
              <p className="text-muted-silver text-body leading-relaxed max-w-xs">
                Diş teknisyenleri için yapay zeka destekli iş yönetim platformu.
              </p>
            </div>

            <div>
              <p className="text-cloud-white text-body font-semibold mb-3 tracking-tight">Ürün</p>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Özellikler</a></li>
                <li><a href="#workflows" className="text-muted-silver text-body hover:text-cloud-white transition-colors">{"Workflow'lar"}</a></li>
                <li><a href="#use-cases" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Kullanım</a></li>
                <li><a href="#pricing" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Fiyatlandırma</a></li>
              </ul>
            </div>

            <div>
              <p className="text-cloud-white text-body font-semibold mb-3 tracking-tight">Destek</p>
              <ul className="space-y-2">
                <li><Link href="/dashboard/support" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="/dashboard/how-to-use" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Nasıl Kullanılır</Link></li>
                <li><Link href="/dashboard/news" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Haberler</Link></li>
                <li><Link href="/dashboard/community" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Topluluk</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-cloud-white text-body font-semibold mb-3 tracking-tight">Yasal</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Gizlilik</a></li>
                <li><a href="#" className="text-muted-silver text-body hover:text-cloud-white transition-colors">KVKK</a></li>
                <li><a href="#" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Kullanım Şartları</a></li>
                <li><a href="#" className="text-muted-silver text-body hover:text-cloud-white transition-colors">Çerezler</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-outline-haze/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-white/[0.04] border border-outline-haze/[0.06] text-muted-silver text-caption">
                <Shield className="w-3 h-3 text-morphic-teal" />
                Türkiye merkezli · KVKK uyumlu
              </div>
              <p className="text-muted-silver text-caption">
                &copy; 2026 DenteSync. Tüm hakları saklıdır.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-pill bg-white/[0.04] border border-outline-haze/[0.06] text-muted-silver text-caption">
                <Globe className="w-3 h-3" strokeWidth={1.8} />
                TR
              </div>
              <div className="flex items-center gap-1.5">
                {SOCIAL_LINKS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 rounded-pill bg-white/[0.04] border border-outline-haze/[0.06] flex items-center justify-center text-muted-silver text-caption font-semibold hover:text-cloud-white hover:bg-white/[0.08] transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
