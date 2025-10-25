"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ChatMessage, type ChatMessageProps } from "@/components/features/ai-triage/chat-message";
import { RiskBadge } from "@/components/features/ai-triage/risk-badge";
import { SymptomSummary } from "@/components/features/ai-triage/symptom-summary";
import { cn } from "@/lib/utils";
import type { TriageSummary } from "@/types/triage";

type DoctorTriageHistoryPanelProps = {
  sessionId: string;
  patientName: string;
  summary: TriageSummary;
  messages: ChatMessageProps[];
};

export function DoctorTriageHistoryPanel({
  sessionId,
  patientName,
  summary,
  messages,
}: DoctorTriageHistoryPanelProps) {
  const [expanded, setExpanded] = useState(messages.length <= 4);
  const displayedMessages = useMemo(
    () => (expanded ? messages : messages.slice(-4)),
    [messages, expanded],
  );
  const hasMoreMessages = messages.length > displayedMessages.length;

  return (
    <section className="rounded-card border border-border/60 bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Riwayat AI Triage</p>
          <h2 className="text-lg font-semibold text-foreground">
            {patientName} • Session #{sessionId.slice(-6)}
          </h2>
        </div>
        <RiskBadge level={summary.riskLevel} />
      </header>
      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Riwayat Pesan</h3>
            {hasMoreMessages ? (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-button border border-border/60 px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                {expanded ? (
                  <>
                    Tampilkan Ringkas <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Lihat Semua {messages.length} <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            ) : null}
          </div>

          <div
            className={cn(
              "flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1",
              expanded ? "max-h-[480px]" : "max-h-[320px]",
            )}
          >
            {displayedMessages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
            {hasMoreMessages && !expanded ? (
              <div className="rounded-card border border-dashed border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                Menampilkan 4 pesan terakhir dari total {messages.length}. Klik “Lihat Semua” untuk
                melihat lengkap.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-card border border-border/60 bg-background p-4">
          <SymptomSummary summary={summary} />
        </div>
      </div>
    </section>
  );
}
