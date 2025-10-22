"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowDown, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, type ChatMessageProps } from "./chat-message";
import { QuickReplies, type QuickReply } from "./quick-replies";
import type { RiskLevel } from "./risk-badge";
import { SymptomSummary } from "./symptom-summary";

type ParsedInsight = {
  riskLevel: RiskLevel;
  symptoms: string[];
  duration: string;
  redFlags: string[];
  updatedAt: string;
};

type BannerState = {
  visible: boolean;
  severity: "warning" | "danger";
  message: string;
  hasShaken: boolean;
};

const initialMessages: ChatMessageProps[] = [
  {
    id: "msg-ai-1",
    role: "ai",
    content:
      "Halo, saya MedLink AI. Saya akan menanyakan beberapa pertanyaan untuk memahami kondisi Anda. Dokter akan meninjau hasil akhirnya.",
    timestamp: "09:02",
  },
];

const initialSummary: ParsedInsight = {
  riskLevel: "low",
  symptoms: ["Belum ada data"],
  duration: "Belum diketahui",
  redFlags: [],
  updatedAt: new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const quickReplyPresets: QuickReply[] = [
  { id: "qr-1", label: "Saya demam", variant: "primary" },
  { id: "qr-2", label: "Ada nyeri dada", variant: "outline" },
  { id: "qr-3", label: "Sesak napas", variant: "primary" },
  { id: "qr-4", label: "Sakit kepala berat", variant: "quiet" },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [banner, setBanner] = useState<BannerState>({
    visible: false,
    severity: "warning",
    message: "",
    hasShaken: false,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [showJumpToNew, setShowJumpToNew] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [noteSnapshot, setNoteSnapshot] = useState<ParsedInsight | null>(null);

  const quickReplies = useMemo(() => quickReplyPresets, []);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(
    initialMessages[initialMessages.length - 1]?.id ?? null,
  );

  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => setIsHydrated(true), []);

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
      const latest = messages[messages.length - 1];
      lastMessageIdRef.current = latest?.id ?? null;
      return;
    }
    const latest = messages[messages.length - 1];
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
    if (!noteSnapshot) return;
    try {
      window.sessionStorage.setItem("medlink-note-snapshot", JSON.stringify(noteSnapshot));
    } catch {
      // ignore storage failures silently
    }
  }, [noteSnapshot]);

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
      if (!text.trim() || isStreaming) {
        return;
      }

      const userMessage: ChatMessageProps = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

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

      await playFakeStream({
        aiMessageId,
        updateMessage,
        setSummary,
        setBanner,
        previousSummary: summary,
        setNoteSnapshot,
      });

      setIsStreaming(false);
      sendButtonRef.current?.focus();
    },
    [addMessage, isStreaming, summary, updateMessage, setSummary, setBanner],
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
            <QuickReplies
              options={quickReplies}
              onSelect={handleQuickReply}
              disabled={isStreaming}
            />
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
  updateMessage: (id: string, updater: Partial<ChatMessageProps>) => void;
  setSummary: React.Dispatch<React.SetStateAction<ParsedInsight>>;
  setBanner: React.Dispatch<React.SetStateAction<BannerState>>;
  previousSummary: ParsedInsight;
  setNoteSnapshot: React.Dispatch<React.SetStateAction<ParsedInsight | null>>;
};

async function playFakeStream({
  aiMessageId,
  updateMessage,
  setSummary,
  setBanner,
  previousSummary,
  setNoteSnapshot,
}: StreamParams) {
  const segments: Array<{ type: "text" | "json"; value: string }> = [
    {
      type: "text",
      value:
        "Terima kasih atas informasinya. Saya akan menanyakan beberapa hal untuk memastikan tidak ada kondisi gawat darurat.\n\n",
    },
    {
      type: "text",
      value:
        "Apakah nyeri dada muncul saat istirahat atau ketika beraktivitas? Beritahu juga jika ada sesak napas berat.\n\n",
    },
    {
      type: "json",
      value: JSON.stringify(
        {
          riskLevel: "moderate",
          symptoms: ["Demam", "Nyeri dada ringan", "Sesak napas ringan"],
          duration: "2 hari",
          redFlags: ["Nyeri dada menjalar ke lengan kiri"],
        },
        null,
        2,
      ),
    },
  ];

  let aggregated = "";
  let isRevealed = false;

  await wait(240);

  for (const segment of segments) {
    if (segment.type === "text") {
      for (const token of segment.value.split("")) {
        aggregated += token;
        if (!isRevealed) {
          updateMessage(aiMessageId, { content: aggregated, isTyping: false });
          isRevealed = true;
        } else {
          updateMessage(aiMessageId, { content: aggregated });
        }
        await wait(26);
      }
    } else {
      aggregated += `\n${segment.value}\n`;
      updateMessage(aiMessageId, { content: aggregated });
      await wait(18);
    }
  }

  const parsedInsight = parseInsight(aggregated, previousSummary);
  setSummary(parsedInsight);
  setNoteSnapshot(parsedInsight);

  updateMessage(aiMessageId, {
    content: aggregated.trimEnd(),
    isTyping: false,
    timestamp: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    riskLevel: parsedInsight.riskLevel,
    redFlag: parsedInsight.redFlags[0],
  });

  if (parsedInsight.redFlags.length > 0 || parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency") {
    setBanner((prev) => ({
      visible: true,
      severity:
        parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency"
          ? "danger"
          : "warning",
      message:
        parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency"
          ? "AI mendeteksi tanda yang membutuhkan perhatian segera. Dokter sedang dihubungi."
          : "AI menemukan indikasi yang perlu ditinjau dokter lebih lanjut.",
      hasShaken: prev.hasShaken,
    }));
  } else {
    setBanner((prev) => ({ ...prev, visible: false }));
  }
}

function parseInsight(message: string, fallback: ParsedInsight): ParsedInsight {
  const jsonMatch = message.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) {
    return { ...fallback, updatedAt: timeNow() };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<ParsedInsight>;
    return {
      riskLevel: parsed.riskLevel ?? fallback.riskLevel,
      symptoms: parsed.symptoms?.length ? parsed.symptoms : fallback.symptoms,
      duration: parsed.duration ?? fallback.duration,
      redFlags: parsed.redFlags ?? [],
      updatedAt: timeNow(),
    };
  } catch {
    return { ...fallback, updatedAt: timeNow() };
  }
}

function timeNow() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
