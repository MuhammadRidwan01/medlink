import { redirect } from "next/navigation";
import { AlertTriangle, Bot } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ChatInterface } from "@/components/features/ai-triage/chat-interface";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  coerceTriageSummary,
  createEmptyTriageSummary,
  formatTriageTimestamp,
  type TriageSummary,
} from "@/types/triage";
import type { ChatMessageProps } from "@/components/features/ai-triage/chat-message";

export default async function PatientTriagePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingSession } = await supabase
    .from("triage_sessions")
    .select("id, summary")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let initialSession:
    | {
        id: string;
        summary: TriageSummary;
        messages: ChatMessageProps[];
      }
    | undefined;

  if (existingSession) {
    const summary = coerceTriageSummary(existingSession.summary, createEmptyTriageSummary());
    const { data: dbMessages } = await supabase
      .from("triage_messages")
      .select("id, role, content, created_at, metadata")
      .eq("session_id", existingSession.id)
      .order("created_at", { ascending: true });

    const mappedMessages: ChatMessageProps[] =
      dbMessages?.map((message) => {
        const metadata = message.metadata;
        const parsedMetadata = isMetadataRecord(metadata) ? metadata : null;

        const riskLevel =
          parsedMetadata && typeof parsedMetadata.risk_level === "string"
            ? (parsedMetadata.risk_level as ChatMessageProps["riskLevel"])
            : undefined;

        const redFlag =
          parsedMetadata &&
          Array.isArray(parsedMetadata.red_flags) &&
          typeof parsedMetadata.red_flags[0] === "string"
            ? parsedMetadata.red_flags[0]
            : undefined;

        return {
          id: `db-${message.id}`,
          role: mapMessageRole(message.role),
          content: message.content,
          timestamp: formatTriageTimestamp(message.created_at ?? new Date()),
          riskLevel,
          redFlag,
        };
      }) ?? [];

    initialSession = {
      id: existingSession.id,
      summary,
      messages: mappedMessages,
    };
  }

  return (
    <PageShell
      title="AI Triage"
      subtitle="Jawab beberapa pertanyaan agar AI dapat menilai kondisi Anda sebelum konsultasi."
    >
      <div className="card-surface space-y-4 p-4">
        <div className="flex items-center gap-3 rounded-card bg-primary/10 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-button bg-primary text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium text-primary">AI bukan pengganti dokter</p>
            <p className="text-small text-muted-foreground">
              Dokter tetap yang mengambil keputusan akhir.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-warning/30 bg-warning/10 p-4 text-warning">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-small">
            Jika Anda mengalami sesak napas berat atau nyeri dada hebat, segera hubungi layanan
            darurat.
          </p>
        </div>
      </div>
      <ChatInterface initialSession={initialSession} />
    </PageShell>
  );
}

function mapMessageRole(role: string): ChatMessageProps["role"] {
  switch (role) {
    case "doctor":
      return "doctor";
    case "user":
      return "user";
    default:
      return "ai";
  }
}

type MetadataRecord = {
  risk_level?: unknown;
  red_flags?: unknown;
};

function isMetadataRecord(value: unknown): value is MetadataRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
