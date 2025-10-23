"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { notificationBus } from "@/components/features/notifications/store";

export function ConfirmationCard({ patient, date, time, onAddReminder }: { patient: string; date: string; time: string; onAddReminder?: () => void }) {
  const [reminder, setReminder] = useState(true);
  return (
    <section className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2 text-success">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm">Follow-up terjadwal untuk {patient} pada {date} • {time}</p>
      </div>
      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
        Tambahkan pengingat ke notifikasi
      </label>
      <div>
        <button
          type="button"
          onClick={() => {
            if (reminder) {
              notificationBus.emit("notify:new", {
                id: `rem-${Date.now()}`,
                category: "reminder",
                title: "Pengingat follow-up",
                description: `${date} • ${time}`,
                timestamp: new Date().toISOString(),
                read: false,
                route: "/patient/inbox",
              });
              onAddReminder?.();
            }
          }}
          className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/50"
        >
          Selesai
        </button>
      </div>
    </section>
  );
}

