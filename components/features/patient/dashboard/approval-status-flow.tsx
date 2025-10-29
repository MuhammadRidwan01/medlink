"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Clock, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Package, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

type FlowStep = {
  key: string;
  icon: any;
  label: string;
  description: string;
  status: "completed" | "current" | "pending" | "error";
  timestamp?: string;
};

type ApprovalStatusFlowProps = {
  approvalStatus: string;
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
};

export function ApprovalStatusFlow({
  approvalStatus,
  createdAt,
  approvedAt,
  rejectionReason,
}: ApprovalStatusFlowProps) {
  const isPending = approvalStatus === "pending";
  const isApproved = approvalStatus === "approved";
  const isRejected = approvalStatus === "rejected";

  const steps: FlowStep[] = [
    {
      key: "created",
      icon: FileText,
      label: "Resep Dibuat",
      description: "AI triage membuat rekomendasi resep",
      status: "completed",
      timestamp: createdAt,
    },
    {
      key: "pending",
      icon: Clock,
      label: "Menunggu Review",
      description: "Dokter sedang meninjau resep Anda",
      status: isPending ? "current" : isApproved ? "completed" : "error",
    },
    {
      key: "reviewed",
      icon: Eye,
      label: "Ditinjau Dokter",
      description: isApproved 
        ? "Resep disetujui oleh dokter"
        : isRejected 
          ? "Resep ditolak oleh dokter"
          : "Menunggu review dokter",
      status: isPending ? "pending" : isApproved ? "completed" : "error",
      timestamp: approvedAt,
    },
    {
      key: "action",
      icon: isApproved ? Package : XCircle,
      label: isApproved ? "Siap Dibeli" : "Ditolak",
      description: isApproved 
        ? "Obat bisa dibeli di marketplace"
        : rejectionReason || "Resep ditolak",
      status: isApproved ? "current" : isRejected ? "error" : "pending",
    },
  ];

  const getStepColor = (status: FlowStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-success bg-success/10 border-success/20";
      case "current":
        return "text-primary bg-primary/10 border-primary/20";
      case "pending":
        return "text-muted-foreground bg-muted/30 border-border/50";
      case "error":
        return "text-danger bg-danger/10 border-danger/20";
      default:
        return "text-muted-foreground bg-muted/30 border-border/50";
    }
  };

  const getConnectorColor = (stepIndex: number) => {
    const currentStep = steps[stepIndex];
    const nextStep = steps[stepIndex + 1];
    
    if (!nextStep) return "border-border/30";
    
    // If current is completed and next is not error
    if (currentStep.status === "completed" && nextStep.status !== "error") {
      return "border-success/50";
    }
    
    // If current is current and next is pending
    if (currentStep.status === "current" && nextStep.status === "pending") {
      return "border-primary/50";
    }
    
    // If next is error
    if (nextStep.status === "error") {
      return "border-danger/50";
    }
    
    return "border-border/30";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-card border border-border/50 bg-background p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Status Approval</h3>
        <p className="text-xs text-muted-foreground">
          Lacak proses approval resep Anda
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.key} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-5 top-10 h-6 w-0.5 border-l-2 border-dashed",
                    getConnectorColor(index)
                  )}
                />
              )}

              {/* Step */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex gap-3"
              >
                {/* Icon */}
                <div className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border",
                  getStepColor(step.status)
                )}>
                  <Icon className="h-4 w-4" />
                  
                  {/* Current Step Indicator */}
                  {step.status === "current" && (
                    <motion.div
                      className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "text-sm font-medium",
                      step.status === "current" ? "text-primary" :
                      step.status === "completed" ? "text-success" :
                      step.status === "error" ? "text-danger" :
                      "text-muted-foreground"
                    )}>
                      {step.label}
                    </h4>
                    
                    {/* Status Badge */}
                    {step.status === "current" && (
                      <span className="rounded-badge bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        Sedang Diproses
                      </span>
                    )}
                    {step.status === "error" && (
                      <span className="rounded-badge bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                        Ditolak
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-1">
                    {step.description}
                  </p>
                  
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground/70">
                      {formatTimestamp(step.timestamp)}
                    </p>
                  )}
                </div>

                {/* Arrow for completed steps */}
                {step.status === "completed" && !isLast && (
                  <ChevronRight className="h-4 w-4 text-success mt-3" />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Estimated Time */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3"
        >
          <div className="flex items-center gap-2 text-xs text-warning">
            <Clock className="h-3 w-3" />
            <span>
              Estimasi waktu review: <strong>1-24 jam</strong>
            </span>
          </div>
          <p className="text-xs text-warning/80 mt-1">
            Dokter akan meninjau resep Anda sesuai antrian
          </p>
        </motion.div>
      )}

      {/* Success Message */}
      {isApproved && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-lg bg-success/5 border border-success/20 p-3"
        >
          <div className="flex items-center gap-2 text-xs text-success">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              Resep disetujui! Obat siap dibeli
            </span>
          </div>
          <p className="text-xs text-success/80 mt-1">
            Kunjungi marketplace untuk membeli obat Anda
          </p>
        </motion.div>
      )}
    </div>
  );
}
