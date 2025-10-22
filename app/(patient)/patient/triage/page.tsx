import { PageShell } from "@/components/layout/page-shell";
import { ChatInterface } from "@/components/features/ai-triage/chat-interface";
import { AlertTriangle, Bot } from "lucide-react";

export default function PatientTriagePage() {
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
      <ChatInterface />
    </PageShell>
  );
}
