"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cubicBezier, motion } from "framer-motion";
import type { EasingFunction, Transition } from "framer-motion";
import {
  ArrowRight,
  ActivitySquare,
  Bell,
  CalendarCheck2,
  MessageSquare,
  Package,
  Pill,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { useNotificationStore } from "@/components/features/notifications/store";
import {
  computeNextDose,
  usePillTimelineStore,
} from "@/components/features/pill-timeline/store";
import {
  MOCK_ORDERS,
  type OrderStatus,
  type OrderSummary,
} from "@/components/features/orders/data";
import {
  getState as getScheduleState,
  subscribeSchedule,
} from "@/components/features/schedule/store";
import { useProfileStore } from "@/components/features/profile/store";

type ScheduleSnapshot = ReturnType<typeof getScheduleState>;

type HighlightCard = {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone?: "accent" | "neutral";
};

type HeroMetric = {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone: "accent" | "neutral";
};

type QuickAction = {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
};

type UpcomingDose = {
  id: string;
  prescriptionId: string;
  prescriptionName: string;
  segmentLabel: string;
  time: string;
  status: "due" | "soon";
};

const cardEase: EasingFunction = cubicBezier(0.4, 0, 0.2, 1);

const cardTransition: Transition = {
  duration: 0.18,
  ease: cardEase,
};

const cardMotion = {
  whileHover: { y: -6 },
  whileTap: { y: -2 },
  transition: cardTransition,
};

function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatOrderStatus(status: OrderStatus) {
  switch (status) {
    case "placed":
      return "Menunggu pembayaran";
    case "paid":
      return "Pembayaran diterima";
    case "packed":
      return "Sedang dikemas";
    case "shipped":
      return "Dalam perjalanan";
    case "delivered":
      return "Selesai";
    case "canceled":
      return "Dibatalkan";
    default:
      return "Diproses";
  }
}

function buildDoseKey(prescriptionId: string, doseId: string) {
  return `${prescriptionId}-${doseId}`;
}

export default function PatientDashboardPage() {
  const notifications = useNotificationStore((state) => state.items);
  const prescriptions = usePillTimelineStore((state) => state.prescriptions);
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );
  const profile = useProfileStore((state) => state.profile);
  const profileLoading = useProfileStore((state) => state.loading);
  const fetchProfileSnapshot = useProfileStore((state) => state.fetchSnapshot);
  const [profileHydrated, setProfileHydrated] = useState(false);

  const latestNotifications = useMemo(
    () =>
      [...notifications]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 3),
    [notifications],
  );

  const doctorNote = useMemo(
    () => notifications.find((item) => item.category === "doctor"),
    [notifications],
  );

  useEffect(() => {
    if (profileHydrated) return;
    fetchProfileSnapshot()
      .catch((error) =>
        console.error("[patient/dashboard] failed to hydrate profile snapshot", error),
      )
      .finally(() => setProfileHydrated(true));
  }, [fetchProfileSnapshot, profileHydrated]);

  const profileMissingFields = useMemo(() => {
    if (!profileHydrated || profileLoading) {
      return [] as string[];
    }

    const missing: string[] = [];
    if (!profile?.name) missing.push("Nama");
    if (!profile?.dob) missing.push("Tanggal lahir");
    if (!profile?.sex) missing.push("Jenis kelamin");
    if (!profile?.bloodType) missing.push("Golongan darah");
    if (!profile?.phone) missing.push("Nomor telepon");
    if (!profile?.address) missing.push("Alamat");

    return missing;
  }, [
    profile?.address,
    profile?.bloodType,
    profile?.dob,
    profile?.name,
    profile?.phone,
    profile?.sex,
    profileHydrated,
    profileLoading,
  ]);

  const [scheduleSnapshot, setScheduleSnapshot] =
    useState<ScheduleSnapshot | null>(null);

  useEffect(() => {
    setScheduleSnapshot(getScheduleState());
    const unsubscribe = subscribeSchedule((snapshot) =>
      setScheduleSnapshot(snapshot),
    );
    return unsubscribe;
  }, []);

  const nextAppointment = useMemo(() => {
    if (!scheduleSnapshot) return null;
    return (
      [...scheduleSnapshot.appointments]
        .filter((appointment) => appointment.status === "scheduled")
        .sort((a, b) => {
          const aDate = new Date(`${a.date}T${a.time}:00`);
          const bDate = new Date(`${b.date}T${b.time}:00`);
          return aDate.getTime() - bDate.getTime();
        })
        .at(0) ?? null
    );
  }, [scheduleSnapshot]);

  const nextAppointmentDate = useMemo(() => {
    if (!nextAppointment) return null;
    const date = new Date(`${nextAppointment.date}T${nextAppointment.time}:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [nextAppointment]);

  const nextDose = useMemo(() => {
    const candidates = prescriptions
      .map((prescription) => {
        const dose = computeNextDose(prescription);
        if (!dose) return null;
        const segmentLabel =
          prescription.segments.find(
            (segment) => segment.id === dose.segmentId,
          )?.label ?? "Jadwal";
        const status = dose.status === "due" ? "due" : "soon";
        return {
          id: dose.id,
          time: dose.time,
          status,
          prescriptionId: prescription.id,
          prescriptionName: prescription.name,
          segmentLabel,
        };
      })
      .filter(Boolean) as UpcomingDose[];

    return (
      candidates.sort((a, b) => {
        if (a.status === "due" && b.status !== "due") return -1;
        if (a.status !== "due" && b.status === "due") return 1;
        return a.time.localeCompare(b.time);
      })[0] ?? null
    );
  }, [prescriptions]);

  const upcomingDoses = useMemo(() => {
    const items: UpcomingDose[] = [];

    prescriptions.forEach((prescription) => {
      prescription.doses
        .filter((dose) => dose.status === "due" || dose.status === "soon")
        .forEach((dose) => {
          const status = dose.status === "due" ? "due" : "soon";
          const segmentLabel =
            prescription.segments.find(
              (segment) => segment.id === dose.segmentId,
            )?.label ?? "Jadwal";
          items.push({
            id: dose.id,
            prescriptionId: prescription.id,
            prescriptionName: prescription.name,
            segmentLabel,
            time: dose.time,
            status,
          });
        });
    });

    return items
      .sort((a, b) => {
        if (a.status === "due" && b.status !== "due") return -1;
        if (a.status !== "due" && b.status === "due") return 1;
        return a.time.localeCompare(b.time);
      })
      .slice(0, 3);
  }, [prescriptions]);

  const activeOrderCount = useMemo(
    () =>
      MOCK_ORDERS.filter(
        (order) => order.status !== "delivered" && order.status !== "canceled",
      ).length,
    [],
  );

  const latestOrder = useMemo<OrderSummary | null>(() => {
    if (!MOCK_ORDERS.length) return null;
    return (
      [...MOCK_ORDERS]
        .sort(
          (a, b) =>
            new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
        )
        .at(0) ?? null
    );
  }, []);

  const followUpHref = nextAppointment
    ? "#jadwalkan-followup"
    : "/patient/followup/self";

  const highlightCards = useMemo<HighlightCard[]>(() => {
    return [
      {
        key: "notifications",
        href: "/patient/notifications",
        icon: Bell,
        label: "Notifikasi",
        value: unreadCount ? `${unreadCount} baru` : "Tidak ada",
        caption: unreadCount
          ? "Tinjau pemberitahuan terbaru Anda."
          : "Semua notifikasi sudah dibaca.",
        tone: unreadCount ? "accent" : "neutral",
      },
      {
        key: "medications",
        href: "/patient/prescriptions",
        icon: Pill,
        label: "Dosis berikutnya",
        value: nextDose ? `${nextDose.time} WIB` : "Selesai",
        caption: nextDose
          ? `${nextDose.prescriptionName} - ${nextDose.segmentLabel}`
          : "Tidak ada pengingat aktif.",
        tone: nextDose?.status === "due" ? "accent" : "neutral",
      },
      {
        key: "followup",
        href: followUpHref,
        icon: CalendarCheck2,
        label: "Follow-up",
        value: nextAppointmentDate
          ? formatDateLabel(nextAppointmentDate)
          : "Belum ada",
        caption: nextAppointmentDate
          ? `${nextAppointment?.time} WIB - ${formatRelativeTime(
              nextAppointmentDate.toISOString(),
            )}`
          : "Jadwalkan kontrol lanjutan.",
        tone: nextAppointment ? "neutral" : "accent",
      },
      {
        key: "orders",
        href: "/patient/orders",
        icon: Package,
        label: "Pesanan",
        value: activeOrderCount ? `${activeOrderCount} aktif` : "Tidak ada",
        caption: latestOrder
          ? `${formatOrderStatus(latestOrder.status)} - ${latestOrder.id}`
          : "Belum ada riwayat pesanan.",
        tone: activeOrderCount ? "neutral" : "neutral",
      },
    ];
  }, [
    activeOrderCount,
    followUpHref,
    latestOrder,
    nextAppointment,
    nextAppointmentDate,
    nextDose,
    unreadCount,
  ]);

  const quickActions = useMemo<QuickAction[]>(() => {
    return [
      {
        key: "triage",
        href: "/patient/triage",
        icon: ActivitySquare,
        label: "Mulai AI Triage",
        description: "Analisa gejala instan sebelum konsultasi.",
      },
      {
        key: "inbox",
        href: "/patient/inbox",
        icon: MessageSquare,
        label: "Balas pesan dokter",
        description: doctorNote
          ? doctorNote.title
          : "Cek percakapan terakhir Anda.",
      },
      {
        key: "prescriptions",
        href: "/patient/prescriptions",
        icon: Pill,
        label: "Atur pengingat obat",
        description: `${prescriptions.length} resep aktif terdaftar.`,
      },
      {
        key: "orders",
        href: "/patient/orders",
        icon: Package,
        label: "Lacak pesanan",
        description: latestOrder
          ? `${formatOrderStatus(latestOrder.status)} - ${latestOrder.id}`
          : "Belum ada pesanan aktif.",
      },
    ];
  }, [doctorNote, latestOrder, prescriptions.length]);

  const greetingName = useMemo(() => {
    if (!profile?.name) {
      return "teman MedLink";
    }
    const [first] = profile.name.split(" ");
    return first || "teman MedLink";
  }, [profile?.name]);

  const triageAction = quickActions.find((action) => action.key === "triage");

  const heroMetrics = useMemo<HeroMetric[]>(() => {
    return [
      {
        key: "appointment",
        icon: CalendarCheck2,
        label: "Janji temu",
        value: nextAppointmentDate
          ? `${formatDateLabel(nextAppointmentDate)} - ${nextAppointment?.time} WIB`
          : "Belum dijadwalkan",
        helper: nextAppointmentDate
          ? formatRelativeTime(nextAppointmentDate.toISOString())
          : "Atur jadwal follow-up",
        tone: nextAppointmentDate ? "neutral" : "accent",
      },
      {
        key: "medication",
        icon: Pill,
        label: "Dosis berikutnya",
        value: nextDose ? `${nextDose.time} WIB` : "Semua dosis tuntas",
        helper: nextDose
          ? `${nextDose.prescriptionName} - ${nextDose.segmentLabel}`
          : "Tidak ada pengingat aktif",
        tone: nextDose?.status === "due" ? "accent" : "neutral",
      },
      {
        key: "notifications",
        icon: Bell,
        label: "Notifikasi",
        value: unreadCount ? `${unreadCount} baru` : "Up to date",
        helper: unreadCount
          ? "Periksa pesan terbaru Anda"
          : "Tidak ada tindakan mendesak",
        tone: unreadCount ? "accent" : "neutral",
      },
    ];
  }, [nextAppointment, nextAppointmentDate, nextDose, unreadCount]);

  return (
    <>
      <PageShell
        title="Ringkasan Pasien"
        subtitle="Navigasikan kontrol kesehatan Anda dalam satu tempat."
        variant="patient"
      >
        <div className="space-y-6">
          <section className="patient-panel relative overflow-hidden px-6 py-7 md:px-9 md:py-9">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="absolute -left-24 top-8 h-44 w-44 rounded-full bg-primary/12 blur-3xl dark:bg-teal-500/12" />
              <div className="absolute -right-16 bottom-12 h-52 w-52 rounded-full bg-sky-400/12 blur-3xl dark:bg-sky-500/18" />
              <div className="absolute inset-x-12 bottom-0 h-24 bg-gradient-to-t from-white/70 via-white/20 to-transparent dark:from-slate-900/80 dark:via-slate-900/30" />
            </div>
            <div className="relative flex flex-col gap-6 text-foreground lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary/70 dark:text-teal-200/70">
                  Ringkasan hari ini
                </p>
                <h1 className="text-3xl font-semibold sm:text-[34px]">
                  Halo, {greetingName}!
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground/90">
                  Kami rangkum jadwal, pengingat obat, dan notifikasi terbaru supaya Anda fokus pada pemulihan.
                </p>
                {doctorNote ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm dark:border-teal-400/30 dark:bg-teal-500/10 dark:text-teal-200">
                    <MessageSquare className="h-4 w-4" />
                    <span>{doctorNote.title}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {triageAction ? (
                  <Link href={triageAction.href} className="button-primary px-6 py-2.5">
                    {triageAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <Link
                  href={followUpHref}
                  className="interactive inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-5 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm transition hover:bg-white/80 dark:border-teal-400/30 dark:bg-slate-900/60 dark:text-teal-200 dark:hover:bg-slate-900/70"
                >
                  {nextAppointment ? "Kelola follow-up" : "Jadwalkan follow-up"}
                </Link>
              </div>
            </div>
            <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <motion.div
                  key={metric.key}
                  whileHover={cardMotion.whileHover}
                  whileTap={cardMotion.whileTap}
                  transition={cardMotion.transition}
                >
                  <div
                    className={[
                      "patient-panel-muted h-full rounded-[18px] px-4 py-4 transition-all",
                      metric.tone === "accent"
                        ? "border border-primary/20 shadow-[0_24px_50px_-35px_rgba(6,182,212,0.65)]"
                        : "border border-white/50 dark:border-slate-700/40",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/10 text-primary dark:bg-teal-500/15 dark:text-teal-200">
                        <metric.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {metric.label}
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                          {metric.helper}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold text-foreground">
                      {metric.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
            <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            {highlightCards.map((card) => (
              <motion.div
                key={card.key}
                className="h-full"
                whileHover={cardMotion.whileHover}
                whileTap={cardMotion.whileTap}
                transition={cardMotion.transition}
              >
                <Link
                  href={card.href}
                  className="group flex h-full items-center gap-4 rounded-[22px] px-5 py-5 patient-panel-muted shadow-[0_22px_45px_-36px_rgba(15,23,42,0.45)] transition-all hover:border-primary/25 hover:shadow-[0_30px_55px_-34px_rgba(6,182,212,0.45)]"
                >
                  <span
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-button",
                      card.tone === "accent"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/50 text-muted-foreground",
                    ].join(" ")}
                  >
                    <card.icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-tiny font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {card.value}
                    </p>
                    <p className="text-tiny text-muted-foreground/80">
                      {card.caption}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
            {profileMissingFields.length ? (
              <motion.div
                key="profile-cta"
                className="h-full"
                whileHover={cardMotion.whileHover}
                whileTap={cardMotion.whileTap}
                transition={cardMotion.transition}
              >
                <Link
                  href="/patient/profile"
                  className="group flex h-full items-center gap-4 rounded-[22px] border border-primary/25 bg-primary/5 px-5 py-5 shadow-[0_26px_55px_-40px_rgba(6,182,212,0.55)] transition-all hover:border-primary/35 hover:bg-primary/8 hover:shadow-[0_34px_60px_-38px_rgba(6,182,212,0.6)] dark:border-teal-400/30 dark:bg-teal-500/5 dark:hover:bg-teal-500/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/18 text-primary dark:bg-teal-500/20 dark:text-teal-200">
                    <User className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-tiny font-semibold uppercase tracking-wide text-primary/80">
                      Lengkapi profil
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {profileMissingFields.length} data penting belum diisi
                    </p>
                    <p className="text-tiny text-muted-foreground/80">
                      {profileMissingFields.slice(0, 3).join(", ")}
                      {profileMissingFields.length > 3 ? " dan lainnya" : ""} diperlukan untuk rekomendasi personal.
                    </p>
                  </div>
                  <span className="tap-target rounded-button bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition group-hover:scale-[1.03]">
                    Lengkapi
                  </span>
                </Link>
              </motion.div>
            ) : null}
          </div>

          <section
            id="jadwalkan-followup"
            className="patient-panel space-y-5 px-6 py-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Aksi cepat
                </h2>
                <p className="text-tiny text-muted-foreground">
                  Tetap terhubung dengan dokter dan layanan MedLink.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <motion.div
                  key={action.key}
                  whileHover={cardMotion.whileHover}
                  whileTap={cardMotion.whileTap}
                  transition={cardMotion.transition}
                >
                  <Link
                    href={action.href}
                    className="group flex h-full items-start gap-4 rounded-[20px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.45)] transition-all hover:border-primary/25 hover:shadow-[0_30px_60px_-38px_rgba(6,182,212,0.45)] dark:border-slate-700/40 dark:bg-slate-900/55"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/12 text-primary dark:bg-teal-500/15 dark:text-teal-200">
                      <action.icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {action.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="patient-panel space-y-5 px-6 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Jadwal obat hari ini
                </h2>
                <Link
                  href="/patient/prescriptions"
                  className="text-tiny font-semibold text-primary hover:underline"
                >
                  Kelola
                </Link>
              </div>
              {upcomingDoses.length ? (
                <ul className="space-y-3">
                  {upcomingDoses.map((dose) => (
                    <li
                      key={buildDoseKey(dose.prescriptionId, dose.id)}
                      className="flex items-start justify-between gap-3 rounded-[18px] border border-white/60 bg-white/70 px-4 py-4 shadow-[0_18px_40px_-35px_rgba(15,23,42,0.35)] backdrop-blur-sm transition hover:border-primary/25 dark:border-slate-700/40 dark:bg-slate-900/55"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {dose.prescriptionName}
                        </p>
                        <p className="text-tiny text-muted-foreground/80">
                          {dose.segmentLabel} - {dose.time} WIB
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition",
                          dose.status === "due"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted/40 text-muted-foreground",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-1.5 w-1.5 rounded-full",
                            dose.status === "due"
                              ? "bg-primary"
                              : "bg-muted-foreground/50",
                          ].join(" ")}
                        />
                        {dose.status === "due" ? "Segera konsumsi" : "Mendatang"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-[18px] border border-dashed border-primary/25 bg-primary/5 px-4 py-4 text-sm text-primary shadow-inner dark:border-teal-400/30 dark:bg-teal-500/5 dark:text-teal-100">
                  Semua dosis hari ini sudah tuntas. Pertahankan!
                </p>
              )}
            </section>

            <section className="patient-panel space-y-5 px-6 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Aktivitas terbaru
                </h2>
                <Link
                  href="/patient/notifications"
                  className="text-tiny font-semibold text-primary hover:underline"
                >
                  Lihat semua
                </Link>
              </div>
              <div className="space-y-3">
                {latestNotifications.length ? (
                  latestNotifications.map((item) => {
                    const Icon =
                      item.category === "doctor"
                        ? MessageSquare
                        : item.category === "reminder"
                          ? Pill
                          : Bell;
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={cardMotion.whileHover}
                        whileTap={cardMotion.whileTap}
                        transition={cardMotion.transition}
                      >
                        <Link
                          href={item.route ?? "/patient/notifications"}
                          className="group flex items-start gap-4 rounded-[18px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.4)] transition hover:border-primary/25 hover:shadow-[0_24px_50px_-34px_rgba(6,182,212,0.45)] dark:border-slate-700/40 dark:bg-slate-900/55"
                        >
                          <span
                            className={[
                              "flex h-9 w-9 items-center justify-center rounded-button shadow-inner",
                              item.category === "doctor"
                                ? "bg-primary/12 text-primary"
                                : "bg-muted/40 text-muted-foreground",
                            ].join(" ")}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {item.title}
                            </p>
                            {item.description ? (
                              <p className="text-tiny text-muted-foreground/80">
                                {item.description}
                              </p>
                            ) : null}
                            <p className="text-tiny text-muted-foreground/70">
                              {formatRelativeTime(item.timestamp)}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="rounded-[18px] border border-dashed border-border/60 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
                    Belum ada aktivitas terbaru. Semua aman.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="patient-panel space-y-5 px-6 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Follow-up & jadwal
              </h2>
              <Link
                href="/patient/followup/self"
                className="text-tiny font-semibold text-primary hover:underline"
              >
                Atur jadwal
              </Link>
            </div>
            {nextAppointmentDate ? (
              <div className="space-y-3 rounded-[20px] border border-white/60 bg-white/75 px-5 py-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.4)] backdrop-blur-sm dark:border-slate-700/40 dark:bg-slate-900/55">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/12 text-primary dark:bg-teal-500/15 dark:text-teal-200">
                    <CalendarCheck2 className="h-5 w-5" />
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDateLabel(nextAppointmentDate)} - {nextAppointment?.time} WIB
                    </p>
                    <p className="text-tiny text-muted-foreground/80">
                      {formatRelativeTime(nextAppointmentDate.toISOString())}
                    </p>
                    {nextAppointment?.reason ? (
                      <p className="text-sm text-muted-foreground/90">
                        Tujuan: {nextAppointment.reason}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-sm text-primary shadow-inner dark:border-teal-400/25 dark:bg-teal-500/5 dark:text-teal-100">
                Belum ada follow-up yang dijadwalkan. Pilih tanggal baru agar dokter dapat memantau perkembangan Anda.
              </div>
            )}
          </section>

          <section className="patient-panel space-y-5 px-6 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Ringkasan pesanan
              </h2>
              <Link
                href="/patient/orders"
                className="text-tiny font-semibold text-primary hover:underline"
              >
                Riwayat pesanan
              </Link>
            </div>
            {latestOrder ? (
              <div className="space-y-3 rounded-[20px] border border-white/60 bg-white/80 px-5 py-5 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.4)] backdrop-blur-sm dark:border-slate-700/40 dark:bg-slate-900/60">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/12 text-primary dark:bg-teal-500/15 dark:text-teal-200">
                    <Package className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {latestOrder.id}
                    </p>
                    <p className="text-tiny text-muted-foreground/80">
                      {formatOrderStatus(latestOrder.status)} -{" "}
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "long",
                      }).format(new Date(latestOrder.placedAt))}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {latestOrder.items.slice(0, 2).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-[14px] border border-white/70 bg-white/75 px-3 py-2 shadow-sm dark:border-slate-700/40 dark:bg-slate-900/60"
                    >
                      <span>{item.name}</span>
                      <span className="text-tiny text-muted-foreground/70">
                        x{item.quantity}
                      </span>
                    </li>
                  ))}
                  {latestOrder.items.length > 2 ? (
                    <li className="text-tiny text-muted-foreground/70">
                      +{latestOrder.items.length - 2} produk lainnya
                    </li>
                  ) : null}
                </ul>
                <div className="flex items-center justify-between rounded-[16px] border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-inner dark:border-teal-400/25 dark:bg-teal-500/10 dark:text-teal-100">
                  <span>Total</span>
                  <span>Rp{latestOrder.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            ) : (
              <p className="rounded-[20px] border border-dashed border-border/60 bg-muted/15 px-5 py-4 text-sm text-muted-foreground">
                Belum ada pesanan aktif.
              </p>
            )}
          </section>
          </div>
        </div>
        </div>
      </PageShell>
    </>
  );
}
