"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { cn } from "@/lib/utils";
import { ChatMessage, type ChatMessageProps } from "./chat-message";
import {
  QuickReplies,
  type QuickReply,
} from "./quick-replies";
import type { RiskLevel } from "./risk-badge";
import { SymptomSummary } from "./symptom-summary";

type ParsedInsight = {
  riskLevel: RiskLevel;
  symptoms: string[];
  duration: string;
  redFlags: string[];
  updatedAt: string;
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
  { id: "1", label: "Saya demam" },
  { id: "2", label: "Ada nyeri dada" },
  { id: "3", label: "Sesak napas" },
  { id: "4", label: "Sakit kepala berat" },
];

type BannerState = {
  visible: boolean;
  severity: "warning" | "danger";
  message: string;
  hasShaken: boolean;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [quickReplies] = useState(quickReplyPresets);
  const [banner, setBanner] = useState<BannerState>({
    visible: false,
    severity: "warning",
    message: "",
    hasShaken: false,
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom(!isStreaming);
  }, [messages, isStreaming, scrollToBottom]);

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

      await playFakeStream(aiMessageId, updateMessage, setSummary, setBanner, summary);
      setIsStreaming(false);
    },
    [addMessage, isStreaming, summary, updateMessage],
  );

  const handleQuickReply = useCallback(
    (option: QuickReply) => {
      handleSendMessage(option.label);
    },
    [handleSendMessage],
  );

  const bannerColor = useMemo(() => {
    if (banner.severity === "danger") {
      return "border-danger/40 bg-danger text-white";
    }
    return "border-warning/40 bg-warning/10 text-warning";
  }, [banner.severity]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative flex min-h-[70vh] flex-col rounded-card bg-card shadow-md">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            ref={listRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-4 md:px-6"
          >
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
                    "flex items-start gap-3 rounded-card border px-4 py-3 text-sm shadow-sm",
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
            {isStreaming ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-card border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary"
              >
                MedLink AI sedang mengetik…
              </motion.div>
            ) : null}
            <div ref={bottomRef} />
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
      <SymptomSummary
        summary={summary}
        className="lg:pl-0"
      />
    </div>
  );
}

async function playFakeStream(
  aiMessageId: string,
  updateMessage: (id: string, updater: Partial<ChatMessageProps>) => void,
  setSummary: Dispatch<SetStateAction<ParsedInsight>>,
  setBanner: Dispatch<SetStateAction<BannerState>>,
  currentSummary: ParsedInsight,
) {
  const responseTemplate = [
    "Terima kasih atas informasinya. Saya akan menanyakan beberapa hal untuk memastikan tidak ada kondisi gawat darurat.\n\n",
    "Apakah nyeri dada muncul saat istirahat atau ketika beraktivitas? Beritahu juga jika ada sesak napas berat.\n\n",
    JSON.stringify(
      {
        riskLevel: "moderate",
        symptoms: ["Demam", "Nyeri dada ringan", "Sesak napas ringan"],
        duration: "2 hari",
        redFlags: ["Nyeri dada menjalar ke lengan kiri"],
      },
      null,
      2,
    ),
  ];

  let aggregated = "";
  for (const chunk of responseTemplate) {
    for (const char of chunk) {
      aggregated += char;
      updateMessage(aiMessageId, { content: aggregated, isTyping: false });
      await wait(35);
    }
  }

  const parsedInsight = parseInsight(aggregated, currentSummary);
  setSummary(parsedInsight);
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

  if (parsedInsight.redFlags.length > 0 || parsedInsight.riskLevel === "high") {
    setBanner((prev) => ({
      visible: true,
      severity: parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency"
        ? "danger"
        : "warning",
      message:
        parsedInsight.riskLevel === "high" || parsedInsight.riskLevel === "emergency"
          ? "AI mendeteksi tanda yang membutuhkan perhatian segera. Dokter sedang dihubungi."
          : "AI menemukan indikasi yang perlu ditinjau dokter lebih lanjut.",
      hasShaken: prev.hasShaken,
    }));
  }
}

function parseInsight(message: string, fallback: ParsedInsight): ParsedInsight {
  const jsonMatch = message.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) {
    return { ...fallback };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ParsedInsight;
    return {
      riskLevel: parsed.riskLevel ?? fallback.riskLevel,
      symptoms: parsed.symptoms?.length ? parsed.symptoms : fallback.symptoms,
      duration: parsed.duration ?? fallback.duration,
      redFlags: parsed.redFlags ?? [],
      updatedAt: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch {
    return fallback;
  }
}

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
