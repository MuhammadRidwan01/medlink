"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  AlertTriangle,
  ArrowDown,
  X,
  ShieldCheck,
  CircleAlert,
  Flame,
  BellRing,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChatMessage, type ChatMessageProps } from "./chat-message";
import { QuickReplies, type QuickReply } from "./quick-replies";
import { SymptomSummary } from "./symptom-summary";
import {
  type Allergy,
  type Medication,
  type ProfileSummary,
  useProfileStore,
} from "@/components/features/profile/store";
import {
  createEmptyTriageSummary,
  coerceTriageSummary,
  formatTriageTimestamp,
  parseTriageInsight,
  hasSignificantChange,
  type RiskLevel,
  type TriageSummary,
} from "@/types/triage";
import { useAddSuggestionsToCart } from "./use-add-suggestions-to-cart";

type ApiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LatestUserMessagePayload = {
  id: string;
  content: string;
  createdAt: string;
};

type BannerState = {
  visible: boolean;
  severity: "warning" | "danger";
  message: string;
  hasShaken: boolean;
};

type PatientContextPayload = {
  profile?: {
    name?: string;
    age?: string;
    sex?: string;
    bloodType?: string;
  };
  allergies?: string[];
  medications?: Array<{
    name: string;
    strength?: string;
    frequency?: string;
  }>;
};

type TriageRequestContext = {
  patient?: PatientContextPayload;
  triageSummary?: {
    riskLevel: RiskLevel;
    symptoms: string[];
    duration: string;
    redFlags: string[];
  };
};

type ChatInterfaceProps = {
  initialSession?: {
    id: string;
    status: "active" | "completed";
    summary: TriageSummary;
    messages: ChatMessageProps[];
  };
};

const quickReplyPresets: QuickReply[] = [
  { id: "qr-1", label: "Saya demam", variant: "primary" },
  { id: "qr-2", label: "Nyeri dada", variant: "outline" },
  { id: "qr-3", label: "Sulit bernapas", variant: "primary" },
  { id: "qr-4", label: "Gejala lainnya", variant: "quiet" },
];

type RiskTheme = {
  label: string;
  description: string;
  gradient: string;
  accentDot: string;
  icon: LucideIcon;
  badge: string;
};

const riskThemes: Record<RiskLevel, RiskTheme> = {
  low: {
    label: "Risiko Rendah",
    description: "Tetap pantau gejala dan lanjutkan anjuran AI.",
    gradient: "from-emerald-500 via-primary to-primary-dark",
    accentDot: "bg-emerald-300",
    icon: ShieldCheck,
    badge: "bg-white/15 text-white",
  },
  moderate: {
    label: "Risiko Moderate",
    description: "AI menyarankan pemantauan lebih lanjut dalam beberapa jam.",
    gradient: "from-amber-500 via-orange-500 to-primary-dark",
    accentDot: "bg-amber-300",
    icon: CircleAlert,
    badge: "bg-white/15 text-white",
  },
  high: {
    label: "Risiko Tinggi",
    description: "Segera hubungi dokter. AI melihat indikasi serius.",
    gradient: "from-rose-500 via-orange-500 to-primary-dark",
    accentDot: "bg-rose-300",
    icon: Flame,
    badge: "bg-white/15 text-white",
  },
  emergency: {
    label: "Darurat",
    description: "Hubungi layanan darurat sekarang juga.",
    gradient: "from-red-500 via-red-600 to-rose-700",
    accentDot: "bg-red-200",
    icon: BellRing,
    badge: "bg-white text-danger",
  },
};

type TimelineEntry =
  | { type: "divider"; id: string; label: string; highlight: boolean }
  | { type: "message"; message: ChatMessageProps };

export function ChatInterface({ initialSession }: ChatInterfaceProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [sessionStatus, setSessionStatus] = useState<"active" | "completed">(
    initialSession?.status ?? "active",
  );
  const [messages, setMessages] = useState<ChatMessageProps[]>(() => {
    if (initialSession?.messages?.length) {
      return initialSession.messages;
    }
    const now = new Date();
    return [
      {
        id: "msg-ai-welcome",
        role: "ai",
        content:
          "Halo, saya MedLink AI. Saya akan menanyakan beberapa pertanyaan untuk memahami kondisi Anda. Dokter akan meninjau hasil akhirnya.",
        timestamp: formatTriageTimestamp(now),
        occurredAt: now.toISOString(),
      },
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [summary, setSummary] = useState<TriageSummary>(
    () => initialSession?.summary ?? createEmptyTriageSummary(),
  );
  const [banner, setBanner] = useState<BannerState>({
    visible: false,
    severity: "warning",
    message: "",
    hasShaken: false,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [showJumpToNew, setShowJumpToNew] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [sessionBusy, setSessionBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showFinalPanel, setShowFinalPanel] = useState(initialSession?.status === "completed");
  const [otcBusy, setOtcBusy] = useState(false);
  const [otcSuggestions, setOtcSuggestions] = useState<Array<{
    name: string; code: string; strength: string; dose: string; frequency: string; duration: string; notes?: string; rationale?: string;
  }>>([]);
  const otcAutoFetchedRef = useRef(false);
  const [otcMessageAdded, setOtcMessageAdded] = useState(false);

  const quickReplies = useMemo(() => quickReplyPresets, []);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(
    initialSession?.messages?.[initialSession.messages.length - 1]?.id ?? messages.at(-1)?.id ?? null,
  );

  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => setIsHydrated(true), []);

  // Warn before leaving if session still active
  useEffect(() => {
    if (!isHydrated) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (sessionStatus === "active" && (messages.length > 1 || isStreaming)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isHydrated, sessionStatus, messages.length, isStreaming]);

  const profile = useProfileStore((state) => state.profile);
  const allergies = useProfileStore((state) => state.allergies);
  const medications = useProfileStore((state) => state.medications);
  const profileLoading = useProfileStore((state) => state.loading);
  const fetchProfileSnapshot = useProfileStore((state) => state.fetchSnapshot);
  const hasRequestedSnapshotRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    const hasPatientData =
      Boolean(profile) || (allergies?.length ?? 0) > 0 || (medications?.length ?? 0) > 0;

    if (hasPatientData || profileLoading || hasRequestedSnapshotRef.current) {
      return;
    }

    hasRequestedSnapshotRef.current = true;
    fetchProfileSnapshot()
      .then(() => {
        hasRequestedSnapshotRef.current = true;
      })
      .catch((error) => {
        console.warn("Failed to hydrate patient snapshot for triage:", error);
        hasRequestedSnapshotRef.current = false;
      });
  }, [isHydrated, profile, allergies, medications, profileLoading, fetchProfileSnapshot]);

  const patientContext = useMemo(
    () => buildPatientContext({ profile, allergies, medications }),
    [profile, allergies, medications],
  );

  // Auto-fetch OTC prescription when AI recommends OTC and add as chat message
  useEffect(() => {
    if (!isHydrated || otcBusy || isStreaming) return;
    if (summary?.recommendation?.type !== "otc") {
      otcAutoFetchedRef.current = false;
      setOtcMessageAdded(false);
      if (otcSuggestions.length) {
        setOtcSuggestions([]);
      }
      return;
    }
    if (otcAutoFetchedRef.current) return;
    otcAutoFetchedRef.current = true;
    setOtcBusy(true);
    (async () => {
      try {
        const res = await fetch("/api/ai/prescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient: {
              profile: patientContext?.profile ? {
                id: "self",
                name: patientContext?.profile?.name ?? null,
                age: patientContext?.profile?.age ?? null,
                sex: patientContext?.profile?.sex ?? null,
                bloodType: patientContext?.profile?.bloodType ?? null,
              } : null,
              allergies: (patientContext?.allergies || []).map((s) => ({ substance: s })),
              meds: (patientContext?.medications || []).map((m) => ({ name: m.name, strength: m.strength ?? null, frequency: m.frequency ?? null, status: "active" })),
            },
            triageSummary: {
              riskLevel: summary?.riskLevel,
              symptoms: summary?.symptoms,
              duration: summary?.duration,
              redFlags: summary?.redFlags,
            },
            provisionalDiagnosis: undefined,
          }),
        });
        if (!res.ok) throw new Error("Gagal membuat draf OTC AI");
        const data = await res.json();
        const items = Array.isArray(data?.suggestions) ? data.suggestions : [];
        setOtcSuggestions(items);
      } catch (e) {
        console.error("Failed to fetch OTC AI draft:", e);
      } finally {
        setOtcBusy(false);
      }
    })();
  }, [
    isHydrated,
    summary,
    patientContext,
    otcBusy,
    isStreaming,
    otcMessageAdded,
    otcSuggestions.length,
  ]);

  // Auto-complete session when AI gives final recommendation
  useEffect(() => {
    if (!isHydrated || isStreaming || sessionStatus === "completed") return;
    if (!summary?.recommendation?.type) return;
    // Auto-complete after recommendation is given
    const timer = setTimeout(() => {
      setSessionStatus("completed");
      setShowFinalPanel(true);
      void fetch("/api/triage/session/complete", { method: "POST" }).catch((error) => {
        console.error("Failed to mark triage session complete:", error);
      });
      
      // For doctor/appointment/emergency, add appointment form
      if (summary.recommendation?.type === "doctor" || 
          summary.recommendation?.type === "appointment" || 
          summary.recommendation?.type === "emergency") {
        const now = new Date();
        const appointmentMessage = {
          id: `msg-appointment-${Date.now()}`,
          role: "ai" as const,
          content: "",
          timestamp: formatTriageTimestamp(now),
          occurredAt: now.toISOString(),
          metadata: { type: "appointment" },
        };
        setMessages((prev) => [...prev, appointmentMessage]);
        
        // Save appointment message to database
        if (sessionId) {
          fetch("/api/triage/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              role: "ai",
              content: "",
              metadata: { type: "appointment" },
            }),
          }).catch((err) => console.error("Failed to save appointment message:", err));
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isHydrated, summary?.recommendation, isStreaming, sessionStatus, sessionId]);

  // Add OTC bubble after fetch completes AND session is completed
  useEffect(() => {
    if (!isHydrated || sessionStatus !== "completed") return;
    if (summary?.recommendation?.type !== "otc") return;
    if (otcSuggestions.length === 0 || otcMessageAdded || otcBusy) return;
    
    setOtcMessageAdded(true);
    const now = new Date();
    const otcMessage = {
      id: `msg-otc-${Date.now()}`,
      role: "ai" as const,
      content: "",
      timestamp: formatTriageTimestamp(now),
      occurredAt: now.toISOString(),
      metadata: { type: "otc", suggestions: otcSuggestions },
    };
    
    setMessages((prev) => [...prev, otcMessage]);
    
    // Save OTC message to database
    if (sessionId) {
      fetch("/api/triage/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          role: "ai",
          content: "",
          metadata: { type: "otc", suggestions: otcSuggestions },
        }),
      }).catch((err) => console.error("Failed to save OTC message:", err));
    }
  }, [
    isHydrated,
    sessionStatus,
    summary?.recommendation,
    otcSuggestions,
    otcSuggestions.length,
    otcMessageAdded,
    otcBusy,
    sessionId,
  ]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollTo({ top: viewport.scrollHeight, behavior });
    },
    [],
  );

  useEffect(() => {
    if (!isHydrated) return;
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [inputValue, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    const viewport = viewportRef.current;
    const sentinel = bottomRef.current;
    if (!viewport || !sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const atBottom = entry.isIntersecting;
        setIsAtBottom(atBottom);
        if (atBottom) {
          setShowJumpToNew(false);
          setLiveAnnouncement("");
        }
      },
      { root: viewport, threshold: 1.0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      lastMessageIdRef.current = messages.at(-1)?.id ?? null;
      return;
    }
    const latest = messages.at(-1);
    const lastId = latest?.id ?? null;
    const prevId = lastMessageIdRef.current;
    const isNewMessage = Boolean(lastId && lastId !== prevId);
    lastMessageIdRef.current = lastId;
    if (!isNewMessage) {
      return;
    }
    if (isAtBottom) {
      scrollToBottom(messages.length <= 2 ? "auto" : "smooth");
    } else {
      setShowJumpToNew(true);
      setLiveAnnouncement("Pesan baru tersedia.");
    }
  }, [messages, isAtBottom, scrollToBottom, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    const targetSessionId = sessionId ?? initialSession?.id;
    if (!targetSessionId) return;

    let isCancelled = false;
    setRestoring(true);

    const params = new URLSearchParams({ sessionId: targetSessionId });

    fetch(`/api/triage/session?${params.toString()}`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok || isCancelled) return;
        const data = (await res.json()) as {
          session: {
            id: string;
            status: "active" | "completed" | null;
            summary: TriageSummary | null;
            updated_at?: string | null;
          } | null;
          messages: Array<{
            id: number | string;
            role: string;
            content: string;
            created_at?: string;
            metadata?: Record<string, any> | null;
          }>;
        };

        if (!data.session || isCancelled) return;

        setSessionId(data.session.id);
        const nextStatus = data.session.status ?? "active";
        setSessionStatus(nextStatus);
        setShowFinalPanel(nextStatus === "completed");

        const hydratedSummary = coerceTriageSummary(
          data.session.summary,
          createEmptyTriageSummary(),
        );
        if (data.session.updated_at) {
          hydratedSummary.updatedAt = data.session.updated_at;
        }
        setSummary(hydratedSummary);

        const mapped: ChatMessageProps[] = (data.messages || []).map((m) => {
          const occurredAtDate = m.created_at ? new Date(m.created_at) : new Date();
          const occurredAtIso = occurredAtDate.toISOString();
          const metadata =
            m.metadata && typeof m.metadata === "object" && !Array.isArray(m.metadata)
              ? (m.metadata as Record<string, any>)
              : undefined;
          return {
            id: `db-${m.id}`,
            role: m.role === "user" ? "user" : m.role === "doctor" ? "doctor" : "ai",
            content: m.content,
            timestamp: formatTriageTimestamp(occurredAtDate),
            occurredAt: occurredAtIso,
            riskLevel:
              metadata && typeof metadata.risk_level === "string"
                ? (metadata.risk_level as ChatMessageProps["riskLevel"])
                : undefined,
            redFlag:
              metadata && Array.isArray(metadata.red_flags) && typeof metadata.red_flags[0] === "string"
                ? (metadata.red_flags[0] as string)
                : undefined,
            metadata,
          };
        });

        if (isCancelled) return;

        if (mapped.length) {
          setMessages(mapped);
        }

        setOtcMessageAdded(mapped.some((msg) => msg.metadata?.type === "otc"));
      })
      .catch((error) => {
        if (!isCancelled) {
          console.error("Failed to restore triage session:", error);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setRestoring(false);
        }
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, sessionId, initialSession?.id]);

  const handleResetSession = useCallback(async () => {
    if (sessionBusy) return;
    setSessionBusy(true);
    try {
      const res = await fetch("/api/triage/session/reset", { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        session: { id: string; summary: TriageSummary } | null;
      };
      if (data.session) {
        setSessionId(data.session.id);
        setSessionStatus("active");
        setShowFinalPanel(false);
        setSummary(data.session.summary ?? createEmptyTriageSummary());
        setBanner({
          visible: false,
          severity: "warning",
          message: "",
          hasShaken: false,
        });
        setOtcSuggestions([]);
        setOtcMessageAdded(false);
        setOtcBusy(false);
        otcAutoFetchedRef.current = false;
        const now = new Date();
        setMessages([
          {
            id: "msg-ai-welcome",
            role: "ai",
            content:
              "Halo, saya MedLink AI. Saya akan menanyakan beberapa pertanyaan untuk memahami kondisi Anda. Dokter akan meninjau hasil akhirnya.",
            timestamp: formatTriageTimestamp(now),
            occurredAt: now.toISOString(),
          },
        ]);
        scrollToBottom("auto");
        router.replace(`/patient/triage?session=${data.session.id}`);
      }
    } finally {
      setSessionBusy(false);
    }
  }, [sessionBusy, scrollToBottom, router]);

  const addMessage = useCallback((message: ChatMessageProps) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback(
    (messageId: string, updater: Partial<ChatMessageProps>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updater } : msg)),
      );
      if (isAtBottom) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    },
    [isAtBottom, scrollToBottom],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      const now = new Date();
      const clientMessageId = `msg-user-${now.getTime()}`;
      const userMessage: ChatMessageProps = {
        id: clientMessageId,
        role: "user",
        content: trimmed,
        timestamp: formatTriageTimestamp(now),
        occurredAt: now.toISOString(),
      };

      const history = buildChatHistory([...messages, userMessage]);

      addMessage(userMessage);
      setInputValue("");
      setIsStreaming(true);
      requestAnimationFrame(() => scrollToBottom("smooth"));

      const aiMessageId = `msg-ai-${Date.now()}`;
      const aiStartedAt = new Date();
      addMessage({
        id: aiMessageId,
        role: "ai",
        content: "",
        timestamp: "",
        occurredAt: aiStartedAt.toISOString(),
        isTyping: true,
      });
      requestAnimationFrame(() => scrollToBottom("smooth"));

      try {
        await streamTriageResponse({
          aiMessageId,
          sessionId,
          setSessionId,
          latestUserMessage: {
            id: clientMessageId,
            content: trimmed,
            createdAt: now.toISOString(),
          },
          updateMessage,
          setSummary,
          setBanner,
          previousSummary: summary,
          context: buildRequestContext(patientContext, summary),
          history,
        });
      } finally {
        setIsStreaming(false);
        sendButtonRef.current?.focus();
      }
    },
    [
      addMessage,
      isStreaming,
      messages,
      summary,
      updateMessage,
      setSummary,
      setBanner,
      patientContext,
      sessionId,
      scrollToBottom,
    ],
  );

  const handleComposerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.shiftKey) {
        return;
      }
      if (isStreaming || sessionStatus === "completed") {
        event.preventDefault();
        return;
      }
      if (!inputValue.trim()) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      handleSendMessage(inputValue);
    },
    [handleSendMessage, inputValue, isStreaming, sessionStatus],
  );

  const handleQuickReply = useCallback(
    (option: QuickReply) => {
      handleSendMessage(option.label);
    },
    [handleSendMessage],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isStreaming || sessionStatus === "completed") {
        return;
      }
      if (event.target && event.target instanceof HTMLElement) {
        const tag = event.target.tagName.toLowerCase();
        if (tag === "textarea" || tag === "input" || event.target.isContentEditable) {
          return;
        }
      }
      const digit = Number.parseInt(event.key, 10);
      if (!Number.isNaN(digit) && digit >= 1 && digit <= quickReplies.length) {
        event.preventDefault();
        const option = quickReplies[digit - 1];
        handleQuickReply(option);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleQuickReply, isStreaming, quickReplies, sessionStatus]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const viewport = event.currentTarget;
    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (distanceFromBottom < 80) {
      setShowJumpToNew(false);
    }
  }, []);

  const bannerColor = useMemo(() => {
    if (banner.severity === "danger") {
      return "border border-danger/40 bg-danger text-white";
    }
    return "border border-warning/40 bg-warning/10 text-warning";
  }, [banner.severity]);

  const riskTheme = useMemo(() => riskThemes[summary.riskLevel ?? "low"], [summary.riskLevel]);
  const summaryUpdatedLabel = useMemo(() => formatSummaryUpdated(summary.updatedAt), [summary.updatedAt]);

const timelineEntries = useMemo(() => {
    const entries: TimelineEntry[] = [];
    let lastLabel: string | null = null;
    for (const message of messages) {
      const meta = getTimelineMeta(message);
      if (meta && meta.label !== lastLabel) {
        entries.push({
          type: "divider",
          id: `divider-${message.id}-${meta.label}`,
          label: meta.label,
          highlight: meta.isToday,
        });
        lastLabel = meta.label;
      }
      entries.push({ type: "message", message });
    }
    return entries;
  }, [messages]);

return (
  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="relative flex min-h-[70vh] flex-col rounded-card bg-card shadow-md">
      <div className="flex flex-1 flex-col overflow-hidden">
        <SessionHeader
          status={sessionStatus}
          onReset={handleResetSession}
          disabled={sessionBusy || isStreaming || restoring}
          updatedLabel={summaryUpdatedLabel}
          summary={summary}
          theme={riskTheme}
        />
        <div
          ref={viewportRef}
          className="relative flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4 md:px-6"
          onScroll={handleScroll}
        >
          <div className="sr-only" aria-live="polite">
            {liveAnnouncement}
          </div>
          <AnimatePresence>
            {banner.visible ? (
              <motion.div
                  key="alert-banner"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  onAnimationComplete={() =>
                    setBanner((prev) => ({ ...prev, hasShaken: true }))
                  }
                  className={cn(
                    "flex items-start gap-3 rounded-card px-4 py-3 text-sm shadow-sm",
                    bannerColor,
                    !banner.hasShaken && "animate-shake",
                  )}
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold uppercase tracking-wide">
                      {banner.severity === "danger" ? "Emergency" : "Perhatian"}
                    </p>
                    <p className="text-small">{banner.message}</p>
                  </div>
                  <button
                    type="button"
                    className="tap-target rounded-full p-1 text-inherit/80 hover:text-inherit"
                    onClick={() =>
                      setBanner((prev) => ({
                        ...prev,
                        visible: false,
                      }))
                    }
                    aria-label="Tutup peringatan"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {timelineEntries.map((entry) => {
              if (entry.type === "divider") {
                return <TimelineDivider key={entry.id} label={entry.label} highlight={entry.highlight} />;
              }
              const message = entry.message;
              if (message.metadata?.type === "otc" && message.metadata?.suggestions) {
                return (
                  <div key={message.id} className="flex justify-start">
                    <OTCBubble suggestions={message.metadata.suggestions} timestamp={message.timestamp} />
                  </div>
                );
              }
              if (message.metadata?.type === "appointment") {
                return (
                  <div key={message.id} className="flex justify-start">
                    <AppointmentBubble summary={summary} onClose={() => {}} />
                  </div>
                );
              }
              return <ChatMessage key={message.id} {...message} />;
            })}

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card via-card/85 to-transparent"
            />

            <div ref={bottomRef} className="h-1 w-full" />

            <AnimatePresence>
              {showJumpToNew ? (
                <motion.div
                  key="jump-button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                  className="pointer-events-none absolute bottom-20 left-0 right-0 flex justify-center"
                >
                  <button
                    type="button"
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-xs font-semibold text-primary shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => {
                      scrollToBottom();
                      setShowJumpToNew(false);
                    }}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    Lihat pesan terbaru
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="relative border-t border-border/40 bg-card/90 px-4 py-5 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.55)] backdrop-blur-xl safe-area-bottom md:px-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-6 rounded-t-[24px] bg-gradient-to-t from-transparent via-card/60 to-card/95"
            />
            <div className="relative space-y-3">
              <QuickReplies
                options={quickReplies}
                onSelect={handleQuickReply}
                disabled={isStreaming || sessionStatus === "completed"}
              />
              <AnimatePresence>
                {isStreaming && sessionStatus !== "completed" ? (
                  <motion.div
                    key="streaming-indicator"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    AI sedang menganalisis jawaban Anda...
                  </motion.div>
                ) : null}
              </AnimatePresence>
            {sessionStatus === "completed" ? (
              <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
                <div className="flex items-center gap-2 font-semibold">
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Sesi triage sudah selesai
                </div>
                <p className="text-sm text-primary/80">
                  Mulai sesi baru jika Anda ingin melakukan pengecekan gejala lagi.
                </p>
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="tap-target inline-flex items-center justify-center gap-2 rounded-[20px] bg-primary-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Mulai Sesi Baru
                </button>
              </div>
            ) : (
              <form
                className="mt-4 flex items-end gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSendMessage(inputValue);
                }}
              >
                <label className="sr-only" htmlFor="triage-input">
                  Jawab pertanyaan AI
                </label>
                <textarea
                  id="triage-input"
                  placeholder="Ceritakan gejala yang Anda rasakan..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  ref={inputRef}
                  rows={1}
                  disabled={isStreaming}
                  className="tap-target h-14 flex-1 resize-none rounded-[22px] border border-border/40 bg-background/95 px-4 py-3 text-body shadow-lg outline-none transition-all placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background/60 disabled:opacity-60"
                />
                <button
                  ref={sendButtonRef}
                  type="submit"
                  disabled={isStreaming || !inputValue.trim()}
                  className="interactive tap-target inline-flex h-14 items-center justify-center rounded-[22px] bg-primary-gradient px-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label="Kirim jawaban"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:pl-0 lg:sticky lg:top-24 lg:self-start">
        <SymptomSummary summary={summary} loading={!isHydrated} className="" />
        {showFinalPanel ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 rounded-[28px] border border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background/95 p-6 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">Triage Selesai</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hasil menunjukkan <strong className="text-foreground">risiko {summary.riskLevel}</strong>.
                  {summary.recommendation?.type === "otc" ? " Anda dapat melakukan perawatan mandiri dengan obat OTC." : " Silakan pertimbangkan konsultasi dengan dokter."}
                </p>
              </div>
            </div>

            {/* OTC Recommendations */}
            {summary.recommendation?.type === "otc" && otcSuggestions.length > 0 ? (
              <div className="space-y-3 rounded-[20px] border border-border/50 bg-background/95 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <h4 className="font-semibold text-foreground">Rekomendasi Obat OTC</h4>
                </div>
                <ul className="space-y-2">
                  {otcSuggestions.map((s, idx) => (
                    <li key={idx} className="rounded-lg border border-border/40 bg-muted/30 p-3">
                      <div className="font-semibold text-foreground">{s.name} {s.strength}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="font-medium">{s.dose}</span> | {s.frequency} | {s.duration}
                      </div>
                      {s.notes ? <div className="mt-2 rounded bg-background p-2 text-xs text-muted-foreground">Catatan: {s.notes}</div> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : otcBusy ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
                <span>Memuat rekomendasi obat...</span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="space-y-3 rounded-[20px] border border-border/50 bg-background/95 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Pilih tindakan selanjutnya:</p>
              <div className="grid gap-2">
                {summary.recommendation?.type === "otc" && otcSuggestions.length > 0 ? (
                  <AddToCartButton suggestions={otcSuggestions} />
                ) : null}
                <Link
                  href="/doctor/consultation"
                  className="tap-target flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Buat Appointment dengan Dokter
                </Link>
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="tap-target flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Mulai Triage Baru
                </button>
                <Link
                  href="/patient/dashboard"
                  className="tap-target flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

type StreamParams = {
  aiMessageId: string;
  sessionId: string | null;
  setSessionId: (id: string) => void;
  latestUserMessage: LatestUserMessagePayload;
  updateMessage: (id: string, updater: Partial<ChatMessageProps>) => void;
  setSummary: React.Dispatch<React.SetStateAction<TriageSummary>>;
  setBanner: React.Dispatch<React.SetStateAction<BannerState>>;
  previousSummary: TriageSummary;
  context: TriageRequestContext | null;
  history: ApiChatMessage[];
};

type SessionHeaderProps = {
  status: "active" | "completed";
  onReset: () => void;
  disabled: boolean;
  updatedLabel: string;
  summary: TriageSummary;
  theme: RiskTheme;
};

function SessionHeader({ status, onReset, disabled, updatedLabel, summary, theme }: SessionHeaderProps) {
  const Icon = theme.icon;
  return (
    <div className="relative overflow-hidden border-b border-border/60">
      <div className={cn("absolute inset-0 bg-gradient-to-r", theme.gradient)} aria-hidden />
      <div className="relative flex flex-col gap-4 px-4 py-5 text-white md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Status triase
              </p>
              <p className="text-lg font-semibold">{theme.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="tap-target inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Mulai sesi baru
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold",
              theme.badge,
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", theme.accentDot)} aria-hidden />
            {status === "completed" ? "Sesi selesai" : "Sesi sedang berjalan"}
          </span>
          <span>Terakhir diperbarui {updatedLabel}</span>
          <span className="hidden rounded-full border border-white/30 px-3 py-1 text-xs md:inline">
            Durasi gejala: {summary.duration}
          </span>
        </div>
        <p className="text-sm text-white/90">{theme.description}</p>
      </div>
    </div>
  );
}

function TimelineDivider({ label, highlight }: { label: string; highlight: boolean }) {
  return (
    <div className="relative flex items-center justify-center py-3">
      <span className="absolute inset-x-0 h-px bg-border/60" aria-hidden />
      <span
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm",
          highlight && "border-primary/40 bg-primary/5 text-primary",
        )}
      >
        {highlight ? <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden /> : null}
        {label}
      </span>
    </div>
  );
}

function getTimelineMeta(message: ChatMessageProps) {
  const candidate =
    message.occurredAt ||
    (typeof message.metadata?.occurred_at === "string" ? message.metadata.occurred_at : undefined) ||
    message.timestamp;
  if (!candidate) {
    return null;
  }
  const parsed = parseMessageDate(candidate);
  if (!parsed) return null;
  return { label: formatTimelineLabel(parsed), isToday: isToday(parsed) };
}

function parseMessageDate(value: string): Date | null {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }
  return null;
}

const timelineLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatTimelineLabel(date: Date): string {
  return timelineLabelFormatter.format(date);
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  );
}

function formatSummaryUpdated(updatedAt?: string): string {
  if (!updatedAt) {
    return "baru saja";
  }
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) {
    return "baru saja";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(-diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(-diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(-diffDays, "day");
}

async function streamTriageResponse({
  aiMessageId,
  sessionId,
  setSessionId,
  latestUserMessage,
  updateMessage,
  setSummary,
  setBanner,
  previousSummary,
  context,
  history,
}: StreamParams) {
  if (!history.length) {
    const now = new Date();
    updateMessage(aiMessageId, {
      content: "Maaf, saya belum menerima konteks percakapan. Silakan coba kirim ulang pertanyaannya.",
      isTyping: false,
      timestamp: formatTriageTimestamp(now),
      occurredAt: now.toISOString(),
    });
    return;
  }

  try {
    const response = await fetch("/api/ai/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        latestUserMessage,
        messages: history,
        context,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`AI request failed with status ${response.status}`);
    }

    const headerSessionId = response.headers.get("x-triage-session");
    if (headerSessionId) {
      setSessionId(headerSessionId);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aggregated = "";
    let isFirstChunk = true;
    let lastAppliedSummary = previousSummary;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      aggregated += decoder.decode(value, { stream: true });

      if (isFirstChunk) {
        updateMessage(aiMessageId, { content: aggregated, isTyping: false });
        isFirstChunk = false;
      } else {
        updateMessage(aiMessageId, { content: aggregated });
      }

      const partialInsight = parseTriageInsight(aggregated, lastAppliedSummary);
      if (hasSignificantChange(lastAppliedSummary, partialInsight)) {
        setSummary(partialInsight);
        lastAppliedSummary = partialInsight;
      }
    }

    aggregated += decoder.decode();
    reader.releaseLock();

    const parsedInsight = parseTriageInsight(aggregated, previousSummary);
    
    // Only update summary if there are significant changes
    // This prevents unnecessary UI updates for every chat message
    if (hasSignificantChange(previousSummary, parsedInsight)) {
      setSummary(parsedInsight);
    }

    const completedAt = new Date();

    updateMessage(aiMessageId, {
      content: aggregated.trim(),
      isTyping: false,
      timestamp: formatTriageTimestamp(completedAt),
      occurredAt: completedAt.toISOString(),
      riskLevel: parsedInsight.riskLevel,
      redFlag: parsedInsight.redFlags[0],
    });

    const shouldAlert =
      parsedInsight.redFlags.length > 0 ||
      parsedInsight.riskLevel === "high" ||
      parsedInsight.riskLevel === "emergency";

    if (shouldAlert) {
      setBanner({
        visible: true,
        severity:
          parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency"
            ? "danger"
            : "warning",
        message:
          parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency"
            ? "AI mendeteksi tanda risiko tinggi. Dokter sedang dihubungi."
            : "AI menemukan indikasi yang perlu ditinjau dokter lebih lanjut.",
        hasShaken: false,
      });
    } else {
      setBanner((prev) => ({ ...prev, visible: false }));
    }
    // CTA untuk OTC ditampilkan di UI berdasarkan summary.recommendation.type === 'otc'
  } catch (error) {
    console.error("AI triage stream failed:", error);
    const now = new Date();
    updateMessage(aiMessageId, {
      content:
        "Maaf, layanan AI sedang mengalami gangguan. Silakan coba lagi sebentar lagi atau lanjutkan ke konsultasi dokter.",
      isTyping: false,
      timestamp: formatTriageTimestamp(now),
      occurredAt: now.toISOString(),
    });
    setSummary((prev) => ({ ...prev, updatedAt: new Date().toISOString() }));
    setBanner((prev) => ({ ...prev, visible: false }));
  }
}

function buildChatHistory(messages: ChatMessageProps[]): ApiChatMessage[] {
  const history: ApiChatMessage[] = [];
  for (const message of messages) {
    if (message.role !== "user" && message.role !== "ai") {
      continue;
    }
    const content = message.content.trim();
    if (!content) {
      continue;
    }
    history.push({
      role: message.role === "user" ? "user" : "assistant",
      content,
    });
  }
  return history.slice(-16);
}

function OTCBubble({ suggestions, timestamp }: { suggestions: Array<{ name: string; code: string; strength: string; dose: string; frequency: string; duration: string; notes?: string }>; timestamp?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[85%] space-y-3 rounded-2xl rounded-tl-sm border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background p-4 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground">Rekomendasi Obat OTC</div>
          <div className="text-xs text-muted-foreground">Tersedia tanpa resep dokter</div>
        </div>
      </div>

      <ul className="space-y-2">
        {suggestions.map((s, idx) => (
          <li key={idx} className="rounded-lg border border-border/40 bg-background/80 p-3">
            <div className="font-semibold text-foreground">{s.name} {s.strength}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium">{s.dose}</span> | {s.frequency} | {s.duration}
            </div>
            {s.notes ? (
              <div className="mt-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                Catatan: {s.notes}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <AddToCartButton suggestions={suggestions} />

      {timestamp ? (
        <div className="text-right text-xs text-muted-foreground">{timestamp}</div>
      ) : null}
    </motion.div>
  );
}

function AppointmentBubble({ summary, onClose }: { summary: TriageSummary; onClose: () => void }) {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booking, setBooking] = useState(false);

  const handleBookAppointment = async () => {
    setBooking(true);
    // TODO: Implement actual appointment booking API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBooking(false);
    window.location.href = "/patient/appointments";
  };

  return (
    <div className="space-y-3 rounded-xl border-2 border-warning/30 bg-gradient-to-br from-warning/5 to-background p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20">
            <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Buat Appointment</div>
            <div className="text-xs text-muted-foreground">
              {summary.recommendation?.type === "emergency" ? "Segera konsultasi dengan dokter" : "Disarankan konsultasi dokter"}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="tap-target rounded-full p-1 hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground">Pilih Dokter</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Pilih Dokter --</option>
            <option value="dr-andi">Dr. Andi Wijaya, Sp.PD</option>
            <option value="dr-siti">Dr. Siti Nurhaliza, Sp.A</option>
            <option value="dr-budi">Dr. Budi Santoso, Sp.JP</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-foreground">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Jam</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Jam --</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleBookAppointment}
          disabled={!selectedDoctor || !selectedDate || !selectedTime || booking}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-warning px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-60"
        >
          {booking ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              <span>Membuat appointment...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Konfirmasi Appointment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AddToCartButton({ suggestions }: { suggestions: Array<{ name: string; code?: string }> }) {
  const addSuggestions = useAddSuggestionsToCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToCart = async () => {
    if (isSubmitting || suggestions.length === 0) {
      return;
    }
    setIsSubmitting(true);
    const { added, failed } = await addSuggestions(suggestions, { syncCheckout: true, replaceCart: true });
    setIsSubmitting(false);
    if (failed.length) {
      console.warn("[triage] produk tidak ditemukan:", failed);
    }
    if (added > 0) {
      router.push("/patient/checkout");
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isSubmitting || suggestions.length === 0}
      className="tap-target flex w-full items-center justify-center gap-2 rounded-lg bg-primary-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Menambahkan ke keranjang...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Tambah ke Keranjang & Checkout</span>
        </>
      )}
    </button>
  );
}

function buildPatientContext({
  profile,
  allergies,
  medications,
}: {
  profile: ProfileSummary | null;
  allergies: Allergy[];
  medications: Medication[];
}): PatientContextPayload | null {
  const context: PatientContextPayload = {};

  if (profile) {
    const age = profile.dob ? formatAge(profile.dob) : undefined;
    context.profile = {
      name: profile.name ?? undefined,
      age,
      sex: profile.sex ?? undefined,
      bloodType: profile.bloodType ?? undefined,
    };
  }

  if (allergies.length > 0) {
    context.allergies = allergies.map((item) => {
      const reaction = item.reaction ? ` (${item.reaction})` : "";
      return `${item.substance}${reaction} - ${item.severity}`;
    });
  }

  const activeMeds = medications.filter((item) => item.status === "active");
  if (activeMeds.length > 0) {
    context.medications = activeMeds.map((item) => ({
      name: item.name,
      strength: item.strength || undefined,
      frequency: item.frequency || undefined,
    }));
  }

  if (
    !context.profile &&
    (!context.allergies || context.allergies.length === 0) &&
    (!context.medications || context.medications.length === 0)
  ) {
    return null;
  }

  return context;
}

function formatAge(dob: string): string | undefined {
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > parsed.getMonth() ||
    (now.getMonth() === parsed.getMonth() && now.getDate() >= parsed.getDate());
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  if (age < 0 || age > 120) {
    return undefined;
  }

  return `${age} tahun`;
}

function buildRequestContext(
  patient: PatientContextPayload | null,
  summary: TriageSummary,
): TriageRequestContext | null {
  const payload: TriageRequestContext = {};

  if (patient) {
    payload.patient = patient;
  }

  if (summary) {
    payload.triageSummary = {
      riskLevel: summary.riskLevel,
      symptoms: summary.symptoms,
      duration: summary.duration,
      redFlags: summary.redFlags,
    };
  }

  if (!payload.patient && !payload.triageSummary) {
    return null;
  }

  return payload;
}
