import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  HeartPulse,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react";
import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import { LandingHeroActions, LandingNavActions } from "@/components/features/landing/auth-actions";

const heroHighlights = [
  {
    icon: ShieldCheck,
    title: "Keamanan setara rumah sakit",
    description: "Rekam medis terenkripsi, memenuhi standar HIPAA dan ISO 27001.",
  },
  {
    icon: Bot,
    title: "Triage AI 24/7",
    description: "Asisten AI memprioritaskan kasus kritis dalam hitungan detik.",
  },
  {
    icon: Sparkles,
    title: "Pengalaman pasien modern",
    description: "Satu aplikasi untuk konsultasi, apotek digital, dan edukasi kesehatan.",
  },
];

const partnerLogos = ["Mandiri Inhealth", "Klinik Sehati", "PrimaCare", "Metro Pharma", "SehatWorks"];

const featureCards = [
  {
    icon: HeartPulse,
    title: "Konsultasi Klinik Hybrid",
    description: "Jadwalkan telekonsultasi atau kunjungan tatap muka dengan dokter terpercaya.",
  },
  {
    icon: Pill,
    title: "Apotek Terintegrasi",
    description: "Resep digital otomatis diteruskan ke apotek partner dengan pengantaran cepat.",
  },
  {
    icon: CalendarClock,
    title: "Penjadwalan Pintar",
    description: "Optimalkan jadwal dokter dengan antrean adaptif, reminder, dan follow-up otomatis.",
  },
  {
    icon: Workflow,
    title: "Operasional Klinik Terkendali",
    description: "Dashboard menyeluruh untuk triase, rekam medis, billing, hingga analitik klinis.",
  },
];

const stats = [
  { label: "Pasien aktif", value: "120K+" },
  { label: "Dokter terverifikasi", value: "2.400+" },
  { label: "Rata-rata triase", value: "< 90 detik" },
  { label: "Tingkat kepuasan", value: "4.9/5" },
];

const useCases = [
  {
    icon: Stethoscope,
    title: "Klinik & Rumah Sakit",
    description: "Kelola operasional, tenaga medis, dan patient journey terpadu dengan modul klinik siap pakai.",
  },
  {
    icon: HeartPulse,
    title: "Telemedicine Premium",
    description: "Bangun layanan jarak jauh dengan brand sendiri, lengkap AI triage dan apotek digital.",
  },
  {
    icon: CalendarClock,
    title: "Program Korporasi",
    description: "Monitoring preventif, edukasi personal, dan klaim cashless untuk kesehatan karyawan.",
  },
];

const testimonials = [
  {
    quote:
      "Sejak memakai MedLink AI, waktu respon triase kami turun drastis dan kepuasan pasien meningkat. Integrasinya mulus dengan SOP klinik.",
    name: "dr. Maya Paramita",
    role: "CMO, Klinik Sehati",
  },
  {
    quote:
      "Layanan apotek digitalnya membantu pasien kronis mendapatkan obat tepat waktu. Dashboard monitoringnya sangat informatif.",
    name: "drg. Aditya Mahesa",
    role: "Founder, PrimaCare Network",
  },
];

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[12%] top-[-180px] h-[420px] w-[420px] rounded-full bg-primary/20 blur-[160px]" />
        <div className="absolute right-[-140px] top-[32%] h-[520px] w-[520px] rounded-full bg-secondary/20 blur-[180px]" />
        <div className="absolute bottom-[-160px] left-[22%] h-[360px] w-[360px] rounded-full bg-accent/15 blur-[200px]" />
      </div>

      <header className="sticky top-6 z-30 mx-auto flex w-full max-w-6xl items-center gap-4 rounded-full border border-border/60 bg-background/80 px-5 py-3 shadow-lg shadow-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-base font-semibold text-white shadow-md">
            ML
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              MedLink AI
            </span>
            <span className="text-sm font-semibold text-foreground">Healthcare Operating System</span>
          </div>
        </Link>
        <nav className="ml-auto hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#fitur" className="transition hover:text-foreground">
            Fitur
          </a>
          <a href="#solusi" className="transition hover:text-foreground">
            Solusi
          </a>
          <a href="#testimoni" className="transition hover:text-foreground">
            Testimoni
          </a>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          <ThemeToggle />
          <LandingNavActions />
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-14 px-6 pb-20 pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 lg:px-8 xl:pb-28">
          <div className="space-y-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
              <span>Versi 2.3 tersedia</span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>AI-ready for Clinics</span>
            </div>
            <div className="space-y-6">
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
                Jembatani pasien dan dokter dengan kecerdasan buatan yang humanis.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                MedLink AI membantu klinik, rumah sakit, dan penyedia telemedicine mengotomasi triase,
                mempersonalisasi layanan, dan mempercepat keputusan klinis tanpa mengabaikan sentuhan manusia.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="#fitur"
                className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Lihat kemampuan utama
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <LandingHeroActions />
              <span className="text-sm text-muted-foreground">14 hari gratis. Tidak perlu kartu kredit.</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group flex flex-col gap-3 rounded-3xl border border-border/60 bg-card/90 p-5 shadow-sm transition duration-200 hover:border-primary/40 hover:shadow-xl"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -translate-x-8 translate-y-6 rounded-[36px] bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent blur-3xl lg:-translate-x-14" />
            <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-card/80 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-gradient text-lg font-semibold text-white shadow-md">
                    AI
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Insight AI Terkini</p>
                    <p className="text-xs text-muted-foreground">Dipersonalisasi untuk klinik Anda</p>
                  </div>
                </div>
                <div className="flex h-9 items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 text-xs font-semibold text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Sinkronisasi real-time
                </div>
              </div>
              <div className="space-y-6 px-6 py-8">
                <div className="space-y-3 rounded-3xl border border-primary/25 bg-primary/10 p-5 text-sm text-teal-900 dark:border-primary/20 dark:bg-primary/15 dark:text-primary-foreground">
                  <p className="text-sm font-semibold text-teal-950 dark:text-primary-foreground/80">
                    Prioritas triase pagi ini
                  </p>
                  <ul className="space-y-2 text-sm text-teal-800 dark:text-primary-foreground/90">
                    <li className="flex items-center justify-between rounded-full bg-white/70 px-3 py-2 text-teal-900 transition dark:bg-white/10 dark:text-white/90">
                      <span>Klinik Astuti · Nyeri dada akut</span>
                      <span className="rounded-full bg-teal-600/10 px-2 py-1 text-xs font-semibold text-teal-700 dark:bg-white/15 dark:text-white">
                        Urgent
                      </span>
                    </li>
                    <li className="flex items-center justify-between rounded-full bg-white/50 px-3 py-2 text-teal-800 transition dark:bg-white/5 dark:text-white/80">
                      <span>Telemed · Follow-up diabetes</span>
                      <span className="text-xs uppercase tracking-wide text-teal-600 dark:text-white/70">42 menit</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-3xl border border-border/60 bg-card/90 p-5">
                  <h3 className="text-sm font-semibold text-foreground">Insight klinis</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    82% pasien kronis menunjukkan peningkatan kepatuhan obat setelah reminder otomatis mingguan.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-border/50 bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Triase selesai</p>
                      <p className="text-xl font-semibold text-foreground">1.248</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Kepuasan pasien</p>
                      <p className="text-xl font-semibold text-foreground">4.9/5</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Tetap fokus pada keputusan klinis, kami menangani otomasi, follow-up, dan pengalaman pasien ujung ke ujung.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-background/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground">Dipercaya oleh</p>
            <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 text-base font-semibold text-muted-foreground">
              {partnerLogos.map((logo) => (
                <span key={logo} className="text-muted-foreground/80 transition hover:text-foreground">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Fitur unggulan untuk tim klinik modern</h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Dari triase otomatis hingga pengelolaan apotek digital, MedLink AI memadukan kecerdasan buatan dan workflow
              klinis supaya pasien mendapat perawatan tepat dengan cepat.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group flex h-full flex-col gap-4 rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <div className="mt-auto text-sm font-semibold text-primary transition group-hover:translate-x-1">
                  Pelajari selengkapnya
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="solusi" className="bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <h2 className="text-3xl font-semibold sm:text-4xl">Dirancang untuk berbagai model layanan kesehatan</h2>
              <p className="mt-4 text-base text-muted-foreground">
                MedLink AI fleksibel dipakai oleh jaringan klinik, telemedicine premium, hingga program kesehatan korporasi
                berskala nasional. Pilih modul sesuai kebutuhan, aktifkan, dan tim Anda langsung produktif.
              </p>
            </div>
            <div className="grid gap-6">
              {useCases.map((item) => (
                <div
                  key={item.title}
                  className="group flex flex-col gap-3 rounded-[28px] border border-border/60 bg-card p-6 transition hover:border-primary/40 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <item.icon className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold sm:text-4xl">Angka yang berbicara</h2>
              <p className="text-base text-muted-foreground">
                Data real-time membantu tim medis mengambil keputusan tepat. Platform kami menyelaraskan insight pasien,
                performa klinik, dan kepuasan semua pemangku kepentingan.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-sm transition hover:border-primary/30 hover:shadow-xl"
                >
                  <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimoni" className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
          <div className="space-y-10 text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Dipercaya praktisi kesehatan</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="flex h-full flex-col justify-between rounded-[28px] border border-border/60 bg-card/90 p-6 text-left shadow-sm transition hover:border-primary/40 hover:shadow-xl"
                >
                  <blockquote className="text-base text-muted-foreground">
                    "{testimonial.quote}"
                  </blockquote>
                  <figcaption className="mt-6">
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{testimonial.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto mb-20 w-full max-w-5xl overflow-hidden rounded-[36px] border border-primary/40 bg-primary-gradient px-8 py-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="relative space-y-6 text-center">
            <h2 className="text-3xl font-semibold">Siap membawa layanan kesehatan Anda naik level?</h2>
            <p className="mx-auto max-w-2xl text-base text-white/80">
              Mulai uji coba 14 hari, dapatkan onboarding bersama tim kami, dan nikmati ekosistem MedLink AI untuk tim
              medis, administrasi, hingga pasien.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-md transition hover:bg-white/90"
              >
                Jadwalkan demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Masuk platform
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-base font-semibold text-white shadow-md">
              ML
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">MedLink AI</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Humanising precision healthcare
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#fitur" className="text-sm transition hover:text-foreground">
              Fitur
            </a>
            <a href="#solusi" className="text-sm transition hover:text-foreground">
              Solusi
            </a>
            <Link href="/auth/login" className="text-sm transition hover:text-foreground">
              Masuk
            </Link>
            <Link href="/auth/register" className="text-sm transition hover:text-foreground">
              Daftar
            </Link>
            <Link href="/health/articles" className="text-sm transition hover:text-foreground">
              Pusat edukasi
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">Hak cipta {currentYear} MedLink AI. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
