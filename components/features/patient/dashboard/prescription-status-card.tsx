 "use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Pill, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type PrescriptionItem = {
  id: number;
  name: string;
  medication_type: "otc" | "prescription";
  strength?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
};

type Prescription = {
  id: string;
  status: string;
  approval_status: string;
  created_at: string;
  approved_at?: string;
  rejection_reason?: string;
  prescription_items: PrescriptionItem[];
};

type PrescriptionStatusCardProps = {
  prescription: Prescription;
};

export function PrescriptionStatusCard({ prescription }: PrescriptionStatusCardProps) {
  const isPending = prescription.approval_status === "pending";
  const isApproved = prescription.approval_status === "approved";
  const isRejected = prescription.approval_status === "rejected";

  const rxItems = prescription.prescription_items.filter(
    (item) => item.medication_type === "prescription"
  );
  const otcItems = prescription.prescription_items.filter(
    (item) => item.medication_type === "otc"
  );

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "warning",
      bgClass: "from-warning/5 to-background border-warning/20",
      iconBgClass: "bg-warning/10",
      iconClass: "text-warning",
      badgeClass: "bg-warning/10 text-warning",
      label: "Menunggu Approval",
      description: "Dokter sedang meninjau resep Anda",
    },
    approved: {
      icon: CheckCircle2,
      color: "success",
      bgClass: "from-success/5 to-background border-success/20",
      iconBgClass: "bg-success/10",
      iconClass: "text-success",
      badgeClass: "bg-success/10 text-success",
      label: "Disetujui",
      description: "Resep sudah disetujui, siap dibeli",
    },
    rejected: {
      icon: XCircle,
      color: "danger",
      bgClass: "from-danger/5 to-background border-danger/20",
      iconBgClass: "bg-danger/10",
      iconClass: "text-danger",
      badgeClass: "bg-danger/10 text-danger",
      label: "Ditolak",
      description: "Resep ditolak oleh dokter",
    },
  };

  const config = isPending
    ? statusConfig.pending
    : isApproved
      ? statusConfig.approved
      : statusConfig.rejected;

  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "rounded-card border bg-gradient-to-br p-4 shadow-sm",
        config.bgClass
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", config.iconBgClass)}>
            <StatusIcon className={cn("h-5 w-5", config.iconClass)} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">
              Resep #{prescription.id.slice(0, 8)}
            </h4>
            <p className="text-sm text-muted-foreground">
              {new Date(prescription.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span className={cn("rounded-badge px-2 py-1 text-xs font-semibold", config.badgeClass)}>
          {config.label}
        </span>
      </div>

      {/* Description */}
      <p className="mb-3 text-sm text-muted-foreground">{config.description}</p>

      {/* Prescription Items */}
      <div className="space-y-2">
        {rxItems.length > 0 && (
          <div className={cn(
            "rounded-lg border p-3",
            isPending ? "border-warning/20 bg-warning/5" :
            isApproved ? "border-success/20 bg-success/5" :
            "border-danger/20 bg-danger/5"
          )}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className={cn("h-4 w-4", config.iconClass)} />
              <span className={config.iconClass}>Obat Resep ({rxItems.length})</span>
            </div>
            <ul className="space-y-1">
              {rxItems.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm text-foreground">
                  <Pill className={cn("mt-0.5 h-3 w-3 shrink-0", config.iconClass)} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name} {item.strength}</div>
                    {item.dose && item.frequency && (
                      <div className="text-xs text-muted-foreground">
                        {item.dose} • {item.frequency}
                      </div>
                    )}
                  </div>
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
                  • {item.name} {item.strength}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Rejection Reason */}
      {isRejected && prescription.rejection_reason && (
        <div className="mt-3 rounded-lg border border-danger/20 bg-danger/5 p-3">
          <div className="mb-1 text-xs font-semibold text-danger">Alasan Penolakan:</div>
          <p className="text-xs text-danger/80">{prescription.rejection_reason}</p>
        </div>
      )}

      {/* Action Button */}
      {isApproved && (
        <button className="tap-target mt-3 w-full rounded-button bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md">
          Beli Obat
        </button>
      )}

      {isPending && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/10 p-2 text-xs text-warning">
          <Clock className="h-3 w-3 shrink-0" />
          <span>Estimasi review: 1-24 jam</span>
        </div>
      )}
    </motion.div>
  );
}
