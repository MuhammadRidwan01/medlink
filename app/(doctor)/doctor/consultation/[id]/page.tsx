import { AlertTriangle, BotMessageSquare, ClipboardSignature } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

type ConsultationDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const { id } = params;

  return (
    <PageShell
      title={`Konsultasi ${id}`}
      subtitle="Ikhtisar triase AI, catatan dokter, dan status resep."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface space-y-3 p-4">
          <h3 className="font-semibold">Ringkasan AI</h3>
          <div className="flex items-center gap-2 rounded-card bg-primary/10 p-3 text-sm text-primary">
            <BotMessageSquare className="h-4 w-4" />
            AI mengidentifikasi risiko sedang. Dokter perlu konfirmasi.
          </div>
          <ul className="space-y-2 text-small text-muted-foreground">
            <li>• Pertanyaan lanjutan akan tampil di sini.</li>
            <li>• Red flag akan ditandai otomatis.</li>
          </ul>
        </div>
        <div className="card-surface space-y-3 p-4">
          <h3 className="font-semibold">Keputusan Dokter</h3>
          <div className="flex items-center gap-2 rounded-card bg-warning/10 p-3 text-sm text-warning">
            <AlertTriangle className="h-4 w-4" />
            Resep belum disetujui dokter.
          </div>
          <p className="text-small text-muted-foreground">
            Dokter akan melakukan peninjauan sebelum resep dikirim ke pasien.
          </p>
          <div className="inline-flex items-center gap-2 rounded-button bg-secondary/10 px-3 py-2 text-tiny font-medium text-secondary">
            <ClipboardSignature className="h-4 w-4" />
            Tanda tangan digital akan tersedia di fase selanjutnya.
          </div>
        </div>
      </div>
    </PageShell>
  );
}

