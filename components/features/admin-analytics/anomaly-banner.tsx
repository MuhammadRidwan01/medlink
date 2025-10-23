"use client";

import { AlertTriangle } from "lucide-react";

export function AnomalyBanner({ type, message }: { type: "spike" | "drop"; message: string }) {
  const cls = type === "spike" ? "border-warning/30 bg-warning/10 text-warning" : "border-danger/30 bg-danger/10 text-danger";
  return (
    <div className={`rounded-card border ${cls} p-3 text-sm`} role="alert" aria-live="polite">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}

