"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertCircle, Pill } from "lucide-react";
import { cn } from "@/lib/utils";

type PrescriptionItem = {
  id: number;
  name: string;
  medication_type: "otc" | "prescription";
  requires_approval: boolean;
};

type Profile = {
  name: string;
  dob: string;
};

type PrescriptionApproval = {
  id: string;
  patient_id: string;
  status: string;
  approval_status: string;
  created_at: string;
  profiles: Profile;
  prescription_items: PrescriptionItem[];
};

type PrescriptionApprovalCardProps = {
  prescription: PrescriptionApproval;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
};

export function PrescriptionApprovalCard({
  prescription,
  onApprove,
  onReject,
}: PrescriptionApprovalCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(prescription.id);
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    setIsRejecting(true);
    try {
      await onReject(prescription.id, rejectionReason);
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  const rxItems = prescription.prescription_items.filter(
    (item) => item.medication_type === "prescription"
  );
  const otcItems = prescription.prescription_items.filter(
    (item) => item.medication_type === "otc"
  );

  const age = calculateAge(prescription.profiles.dob);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-card border border-warning/20 bg-gradient-to-br from-warning/5 to-background p-4 shadow-sm"
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                {prescription.profiles.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {age} tahun • {new Date(prescription.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
          <span className="rounded-badge bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
            Menunggu Approval
          </span>
        </div>

        {/* Prescription Items */}
        <div className="mb-3 space-y-2">
          {rxItems.length > 0 && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertCircle className="h-4 w-4" />
                <span>Obat Resep ({rxItems.length})</span>
              </div>
              <ul className="space-y-1">
                {rxItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-foreground">
                    <Pill className="h-3 w-3 text-warning" />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {otcItems.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-background/50 p-3">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                Obat OTC ({otcItems.length})
              </div>
              <ul className="space-y-1">
                {otcItems.map((item) => (
                  <li key={item.id} className="text-xs text-muted-foreground">
                    • {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className={cn(
              "tap-target flex flex-1 items-center justify-center gap-2 rounded-button px-4 py-2.5 text-sm font-semibold shadow-sm transition",
              "bg-success text-white hover:shadow-md disabled:opacity-60"
            )}
          >
            {isApproving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Menyetujui...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Setujui</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={isApproving || isRejecting}
            className={cn(
              "tap-target flex flex-1 items-center justify-center gap-2 rounded-button px-4 py-2.5 text-sm font-semibold shadow-sm transition",
              "border border-danger/20 bg-danger/10 text-danger hover:bg-danger/20 disabled:opacity-60"
            )}
          >
            <XCircle className="h-4 w-4" />
            <span>Tolak</span>
          </button>
        </div>
      </motion.div>

      {/* Reject Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => !isRejecting && setShowRejectDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-card border border-border bg-background p-6 shadow-xl"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Alasan Penolakan
              </h3>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Jelaskan alasan penolakan resep ini..."
                className="mb-4 min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isRejecting}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isRejecting}
                  className="tap-target flex-1 rounded-button border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                  className="tap-target flex flex-1 items-center justify-center gap-2 rounded-button bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:shadow-md disabled:opacity-60"
                >
                  {isRejecting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Menolak...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Tolak Resep</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
