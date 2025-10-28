"use client";

import { motion } from "framer-motion";
import { Clock, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PrescriptionSuggestion = {
  name: string;
  code: string;
  type: "otc" | "prescription";
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
  notes: string;
  rationale: string;
};

type PrescriptionBubbleProps = {
  suggestions: PrescriptionSuggestion[];
  timestamp?: string;
  requiresDoctorApproval?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  onRequestApproval?: () => void;
};

export function PrescriptionBubble({
  suggestions,
  timestamp,
  requiresDoctorApproval = false,
  approvalStatus = "pending",
  onRequestApproval,
}: PrescriptionBubbleProps) {
  const otcMeds = suggestions.filter((s) => s.type === "otc");
  const rxMeds = suggestions.filter((s) => s.type === "prescription");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-2xl flex-col gap-2"
    >
      {/* OTC Medications */}
      {otcMeds.length > 0 && (
        <div className="rounded-card border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">
                Obat Bebas (OTC)
              </h4>
              <p className="text-xs text-muted-foreground">
                Tersedia tanpa resep dokter
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {otcMeds.map((med, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 bg-background/50 p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-foreground">
                      {med.name} {med.strength}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {med.dose} • {med.frequency}
                    </p>
                  </div>
                  <span className="rounded-badge bg-success/10 px-2 py-0.5 text-tiny font-semibold text-success">
                    OTC
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{med.duration}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex gap-2">
                    <span className="font-semibold">💡</span>
                    <p className="flex-1 text-muted-foreground">{med.notes}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">📋</span>
                    <p className="flex-1 text-muted-foreground">
                      {med.rationale}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescription Medications */}
      {rxMeds.length > 0 && (
        <div
          className={cn(
            "rounded-card border p-4 shadow-sm",
            approvalStatus === "approved"
              ? "border-success/20 bg-gradient-to-br from-success/5 to-background"
              : approvalStatus === "rejected"
                ? "border-danger/20 bg-gradient-to-br from-danger/5 to-background"
                : "border-warning/20 bg-gradient-to-br from-warning/5 to-background"
          )}
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                approvalStatus === "approved"
                  ? "bg-success/10"
                  : approvalStatus === "rejected"
                    ? "bg-danger/10"
                    : "bg-warning/10"
              )}
            >
              {approvalStatus === "approved" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : approvalStatus === "rejected" ? (
                <AlertCircle className="h-4 w-4 text-danger" />
              ) : (
                <FileText className="h-4 w-4 text-warning" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground">
                Obat Resep (Rx)
              </h4>
              <p className="text-xs text-muted-foreground">
                {approvalStatus === "approved"
                  ? "Disetujui oleh dokter"
                  : approvalStatus === "rejected"
                    ? "Ditolak oleh dokter"
                    : "Memerlukan persetujuan dokter"}
              </p>
            </div>
            {approvalStatus === "pending" && (
              <span className="rounded-badge bg-warning/10 px-2 py-1 text-tiny font-semibold text-warning">
                Menunggu Approval
              </span>
            )}
            {approvalStatus === "approved" && (
              <span className="rounded-badge bg-success/10 px-2 py-1 text-tiny font-semibold text-success">
                Disetujui
              </span>
            )}
            {approvalStatus === "rejected" && (
              <span className="rounded-badge bg-danger/10 px-2 py-1 text-tiny font-semibold text-danger">
                Ditolak
              </span>
            )}
          </div>

          <div className="space-y-3">
            {rxMeds.map((med, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 bg-background/50 p-3"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-foreground">
                      {med.name} {med.strength}
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      {med.dose} • {med.frequency}
                    </p>
                  </div>
                  <span className="rounded-badge bg-warning/10 px-2 py-0.5 text-tiny font-semibold text-warning">
                    Rx
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{med.duration}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex gap-2">
                    <span className="font-semibold">💡</span>
                    <p className="flex-1 text-muted-foreground">{med.notes}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">📋</span>
                    <p className="flex-1 text-muted-foreground">
                      {med.rationale}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {approvalStatus === "pending" && requiresDoctorApproval && (
            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Resep ini memerlukan persetujuan dokter sebelum dapat dibeli.
                  Dokter akan meninjau dan menyetujui dalam waktu 24 jam.
                </p>
              </div>
              {onRequestApproval && (
                <button
                  onClick={onRequestApproval}
                  className="tap-target w-full rounded-button bg-primary-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg"
                >
                  Kirim ke Dokter untuk Approval
                </button>
              )}
            </div>
          )}

          {approvalStatus === "approved" && (
            <div className="mt-4">
              <button className="tap-target w-full rounded-button bg-success-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg">
                Tambah ke Keranjang & Checkout
              </button>
            </div>
          )}

          {approvalStatus === "rejected" && (
            <div className="mt-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">
              <p className="font-semibold">Resep ditolak oleh dokter</p>
              <p className="mt-1">
                Silakan konsultasi langsung dengan dokter untuk mendapatkan
                rekomendasi alternatif.
              </p>
            </div>
          )}
        </div>
      )}

      {timestamp && (
        <div className="text-right text-tiny text-muted-foreground">
          {timestamp}
        </div>
      )}
    </motion.div>
  );
}
