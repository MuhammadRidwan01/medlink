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

type PatientTriagePageProps = {
  searchParams?: Promise<{
    session?: string;
  }>;
};

export default async function PatientTriagePage(props: PatientTriagePageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requestedSessionId =
    typeof searchParams?.session === "string" && searchParams.session.trim()
      ? searchParams.session.trim()
      : undefined;

  type SessionRow = {
    id: string;
    summary: unknown;
    status: "active" | "completed" | null;
    updated_at: string | null;
  };

  let sessionRow: SessionRow | null = null;

  if (requestedSessionId) {
    const { data, error } = await supabase
      .from("triage_sessions")
      .select("id, summary, status, updated_at")
      .eq("patient_id", user.id)
      .eq("id", requestedSessionId)
      .maybeSingle<SessionRow>();

    if (!error && data) {
      sessionRow = data;
    }
  }

  if (!sessionRow) {
    const { data } = await supabase
      .from("triage_sessions")
      .select("id, summary, status, updated_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<SessionRow>();

    sessionRow = data ?? null;
  }

  let initialSession:
    | {
        id: string;
        status: "active" | "completed";
        summary: TriageSummary;
        messages: ChatMessageProps[];
      }
    | undefined;

  if (sessionRow) {
    const summary = coerceTriageSummary(sessionRow.summary, createEmptyTriageSummary());

    if (sessionRow.updated_at) {
      summary.updatedAt = sessionRow.updated_at;
    }

    const { data: dbMessages } = await supabase
      .from("triage_messages")
      .select("id, role, content, created_at, metadata")
      .eq("session_id", sessionRow.id)
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

        const occurredAtIso = message.created_at ?? new Date().toISOString();
        const occurredAtDate = new Date(occurredAtIso);

        return {
          id: `db-${message.id}`,
          role: mapMessageRole(message.role),
          content: message.content,
          timestamp: formatTriageTimestamp(occurredAtDate),
          occurredAt: occurredAtIso,
          riskLevel,
          redFlag,
          metadata: parsedMetadata ?? undefined,
        };
      }) ?? [];

    initialSession = {
      id: sessionRow.id,
      status: sessionRow.status === "completed" ? "completed" : "active",
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
  [key: string]: unknown;
  risk_level?: unknown;
  red_flags?: unknown;
};

function isMetadataRecord(value: unknown): value is MetadataRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
