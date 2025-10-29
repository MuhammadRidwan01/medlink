 "use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Pill, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ApprovalStatusFlow } from "./approval-status-flow";

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
  const [showFlow, setShowFlow] = useState(false);
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

      {/* Approval Status Flow Toggle */}
      <button
        onClick={() => setShowFlow(!showFlow)}
        className="tap-target mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span>Lihat Status Approval</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            showFlow && "rotate-180"
          )} 
        />
      </button>

      {/* Approval Status Flow */}
      <AnimatePresence>
        {showFlow && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <ApprovalStatusFlow
                approvalStatus={prescription.approval_status}
                createdAt={prescription.created_at}
                approvedAt={prescription.approved_at}
                rejectionReason={prescription.rejection_reason}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      {isApproved && (
        <button className="tap-target mt-3 w-full rounded-button bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md">
          Beli Obat
        </button>
      )}
    </motion.div>
  );
}
