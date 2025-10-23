"use client";

import { CheckCircle2 } from "lucide-react";

export function ThanksCard() {
  return (
    <div className="rounded-card border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        <p>Terima kasih! Umpan balik Anda membantu kami meningkatkan layanan.</p>
      </div>
    </div>
  );
}

