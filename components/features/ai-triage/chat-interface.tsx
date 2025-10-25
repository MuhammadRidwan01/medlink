"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowDown, Send, X } from "lucide-react";
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
  formatTriageTimestamp,
  parseTriageInsight,
  type RiskLevel,
  type TriageSummary,
} from "@/types/triage";

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
    summary: TriageSummary;
    messages: ChatMessageProps[];
  };
};

const quickReplyPresets: QuickReply[] = [
  { id: "qr-1", label: "Saya demam", variant: "primary" },
  { id: "qr-2", label: "Ada nyeri dada", variant: "outline" },
  { id: "qr-3", label: "Sesak napas", variant: "primary" },
  { id: "qr-4", label: "Sakit kepala berat", variant: "quiet" },
];

export function ChatInterface({ initialSession }: ChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [messages, setMessages] = useState<ChatMessageProps[]>(() => {
    if (initialSession?.messages?.length) {
      return initialSession.messages;
    }
    return [
      {
        id: "msg-ai-welcome",
        role: "ai",
        content:
          "Halo, saya MedLink AI. Saya akan menanyakan beberapa pertanyaan untuk memahami kondisi Anda. Dokter akan meninjau hasil akhirnya.",
        timestamp: formatTriageTimestamp(new Date()),
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

  const quickReplies = useMemo(() => quickReplyPresets, []);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(
    initialSession?.messages?.[initialSession.messages.length - 1]?.id ?? messages.at(-1)?.id ?? null,
  );

  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => setIsHydrated(true), []);

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

  const addMessage = useCallback((message: ChatMessageProps) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessage = useCallback((messageId: string, updater: Partial<ChatMessageProps>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updater } : msg)),
    );
  }, []);

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
      };

      const history = buildChatHistory([...messages, userMessage]);

      addMessage(userMessage);
      setInputValue("");
      setIsStreaming(true);

      const aiMessageId = `msg-ai-${Date.now()}`;
      addMessage({
        id: aiMessageId,
        role: "ai",
        content: "",
        timestamp: "",
        isTyping: true,
      });

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
    ],
  );

  const handleQuickReply = useCallback(
    (option: QuickReply) => {
      handleSendMessage(option.label);
    },
    [handleSendMessage],
  );

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

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative flex min-h-[70vh] flex-col rounded-card bg-card shadow-md">
        <div className="flex flex-1 flex-col overflow-hidden">
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

            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}

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

          <div className="border-t border-border/70 bg-background/95 px-4 py-4 safe-area-bottom md:px-6">
            <QuickReplies options={quickReplies} onSelect={handleQuickReply} disabled={isStreaming} />
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
                placeholder="Ceritakan gejala yang Anda rasakan…"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={1}
                disabled={isStreaming}
                className="tap-target h-14 flex-1 resize-none rounded-card border border-input bg-background px-4 py-3 text-body shadow-sm outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
              <button
                ref={sendButtonRef}
                type="submit"
                disabled={isStreaming || !inputValue.trim()}
                className="interactive tap-target inline-flex h-14 items-center justify-center rounded-full bg-primary-gradient px-6 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                aria-label="Kirim jawaban"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <SymptomSummary summary={summary} loading={!isHydrated} className="lg:pl-0" />
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
    updateMessage(aiMessageId, {
      content: "Maaf, saya belum menerima konteks percakapan. Silakan coba kirim ulang pertanyaannya.",
      isTyping: false,
      timestamp: formatTriageTimestamp(new Date()),
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
    const timestamp = formatTriageTimestamp(new Date());
    let aggregated = "";
    let isFirstChunk = true;

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
    }

    aggregated += decoder.decode();
    reader.releaseLock();

    const parsedInsight = parseTriageInsight(aggregated, previousSummary);
    setSummary(parsedInsight);

    updateMessage(aiMessageId, {
      content: aggregated.trim(),
      isTyping: false,
      timestamp,
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
  } catch (error) {
    console.error("AI triage stream failed:", error);
    updateMessage(aiMessageId, {
      content:
        "Maaf, layanan AI sedang mengalami gangguan. Silakan coba lagi sebentar lagi atau lanjutkan ke konsultasi dokter.",
      isTyping: false,
      timestamp: formatTriageTimestamp(new Date()),
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
