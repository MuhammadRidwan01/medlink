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
      >
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-primary/40 bg-gradient-to-br from-primary/95 via-primary to-primary-dark px-6 py-8 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-70">
              <div className="absolute left-[-10%] top-[-40%] h-48 w-48 rounded-full bg-white/25 blur-3xl" />
              <div className="absolute right-[-15%] bottom-[-35%] h-64 w-64 rounded-full bg-white/20 blur-[120px]" />
            </div>
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Ringkasan hari ini
                </p>
                <h1 className="text-3xl font-semibold sm:text-4xl">
                  Halo, {greetingName}!
                </h1>
                <p className="max-w-xl text-sm text-white/80">
                  Kami rangkum jadwal, pengingat obat, dan notifikasi terbaru supaya Anda fokus pada pemulihan.
                </p>
                {doctorNote ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-medium text-white/90 backdrop-blur">
                    <MessageSquare className="h-4 w-4" />
                    <span>{doctorNote.title}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {triageAction ? (
                  <Link
                    href={triageAction.href}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow-md transition hover:shadow-lg"
                  >
                    {triageAction.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <Link
                  href={followUpHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {nextAppointment ? "Kelola follow-up" : "Jadwalkan follow-up"}
                </Link>
              </div>
            </div>
            <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <motion.div
                  key={metric.key}
                  whileHover={cardMotion.whileHover}
                  whileTap={cardMotion.whileTap}
                  transition={cardMotion.transition}
                >
                  <div
                    className={[
                      "group h-full rounded-[22px] border px-4 py-4 backdrop-blur transition",
                      metric.tone === "accent"
                        ? "border-white/40 bg-white/25 shadow-lg shadow-white/20"
                        : "border-white/25 bg-white/15",
                    ].join(" ")}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
                      <metric.icon className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                      {metric.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {metric.helper}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                  className="group flex h-full items-center gap-3 rounded-card border border-border/50 bg-card/95 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-card"
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
                  className="group flex h-full items-center gap-3 rounded-card border border-primary/50 bg-primary/5 p-4 shadow-sm transition-colors hover:border-primary/60 hover:bg-primary/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/20 text-primary">
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
            className="card-surface space-y-4 p-4"
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
            <div className="grid gap-3 md:grid-cols-2">
              {quickActions.map((action) => (
                <motion.div
                  key={action.key}
                  whileHover={cardMotion.whileHover}
                  whileTap={cardMotion.whileTap}
                  transition={cardMotion.transition}
                >
                  <Link
                    href={action.href}
                    className="group flex h-full items-start gap-3 rounded-card border border-transparent bg-gradient-to-br from-muted/40 via-muted/30 to-transparent p-4 transition-colors hover:border-primary/40 hover:bg-muted/50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/15 text-primary">
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

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card-surface space-y-4 p-4">
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
                      className="flex items-start justify-between gap-3 rounded-card border border-border/50 bg-muted/30 px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {dose.prescriptionName}
                        </p>
                        <p className="text-tiny text-muted-foreground">
                          {dose.segmentLabel} - {dose.time} WIB
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                          dose.status === "due"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted/60 text-muted-foreground",
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
                <p className="rounded-card border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Semua dosis hari ini sudah tuntas. Pertahankan!
                </p>
              )}
            </section>

            <section className="card-surface space-y-4 p-4">
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
                          className="group flex items-start gap-3 rounded-card border border-transparent bg-muted/30 p-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
                        >
                          <span
                            className={[
                              "flex h-9 w-9 items-center justify-center rounded-button",
                              item.category === "doctor"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted/60 text-muted-foreground",
                            ].join(" ")}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {item.title}
                            </p>
                            {item.description ? (
                              <p className="text-tiny text-muted-foreground">
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
                  <p className="rounded-card border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Belum ada aktivitas terbaru. Semua aman.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-4">
          <section className="card-surface space-y-4 p-4">
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
              <div className="space-y-3 rounded-card border border-border/60 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/15 text-primary">
                    <CalendarCheck2 className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {formatDateLabel(nextAppointmentDate)} -{" "}
                      {nextAppointment?.time} WIB
                    </p>
                    <p className="text-tiny text-muted-foreground">
                      {formatRelativeTime(nextAppointmentDate.toISOString())}
                    </p>
                    {nextAppointment?.reason ? (
                      <p className="mt-2 text-sm text-muted-foreground/90">
                        Tujuan: {nextAppointment.reason}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-primary/40 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">
                  Belum ada follow-up yang dijadwalkan.
                </p>
                <p className="text-tiny text-primary/80">
                  Pilih tanggal baru agar dokter dapat memantau perkembangan
                  Anda.
                </p>
              </div>
            )}
          </section>

          <section className="card-surface space-y-4 p-4">
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
              <div className="space-y-3 rounded-card border border-border/60 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary/15 text-primary">
                    <Package className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {latestOrder.id}
                    </p>
                    <p className="text-tiny text-muted-foreground">
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
                      className="flex items-center justify-between"
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
                <div className="flex items-center justify-between text-sm text-foreground">
                  <span>Total</span>
                  <span className="font-semibold">
                    Rp{latestOrder.total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ) : (
              <p className="rounded-card border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
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
