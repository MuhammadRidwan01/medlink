import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { ConsultationWorkspace } from "@/components/features/doctor/consultation-workspace";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  coerceTriageSummary,
  createEmptyTriageSummary,
  formatTriageTimestamp,
  type TriageSummary,
} from "@/types/triage";
import type { ChatMessageProps } from "@/components/features/ai-triage/chat-message";
import { DoctorTriageHistoryPanel } from "@/components/features/doctor/triage-history-panel";

type ConsultationDetailPageParams = {
  id: string;
};

type ConsultationDetailPageProps = {
  params?: Promise<ConsultationDetailPageParams>;
};

export default async function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const resolvedParams = params ? await params : undefined;
  const id = resolvedParams?.id;

  if (!id) {
    notFound();
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("triage_sessions")
    .select("id, patient_id, summary")
    .eq("id", id)
    .maybeSingle();

  if (!session) {
    notFound();
  }

  const summary: TriageSummary = coerceTriageSummary(session.summary, createEmptyTriageSummary());
  const { data: dbMessages } = await supabase
    .from("triage_messages")
    .select("id, role, content, created_at, metadata")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  const triageMessages: ChatMessageProps[] =
    dbMessages?.map((message) => ({
      id: `db-${message.id}`,
      role: mapMessageRole(message.role),
      content: message.content,
      timestamp: formatTriageTimestamp(message.created_at ?? new Date()),
      riskLevel:
        typeof message.metadata?.risk_level === "string"
          ? (message.metadata.risk_level as ChatMessageProps["riskLevel"])
          : undefined,
      redFlag: Array.isArray(message.metadata?.red_flags)
        ? (message.metadata.red_flags as string[])[0]
        : undefined,
    })) ?? [];

  const { data: patientProfile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", session.patient_id)
    .maybeSingle();

  return (
    <PageShell
      title={`Konsultasi ${patientProfile?.name ?? "Pasien"}`}
      subtitle="Workspace dokter dengan antrian pasien, pesan realtime, dan snapshot klinis."
      className="space-y-6"
    >
      <DoctorTriageHistoryPanel
        sessionId={session.id}
        patientName={patientProfile?.name ?? "Pasien"}
        summary={summary}
        messages={triageMessages}
      />
      <ConsultationWorkspace consultationId={id} />
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
