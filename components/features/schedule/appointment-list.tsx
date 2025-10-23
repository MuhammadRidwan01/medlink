"use client";

import { useEffect, useState } from "react";
import { cancelAppointment, completeAppointment, subscribeSchedule, getState, type Appointment } from "./store";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppointmentList() {
  const [items, setItems] = useState<Appointment[]>(getState().appointments);
  useEffect(() => subscribeSchedule((s) => setItems(s.appointments)), []);
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Appointments</h3>
      </div>
      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="rounded-card border border-border/60 bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{a.patient}</p>
                <p className="text-xs text-muted-foreground">{a.date} • {a.time} {a.reason ? `• ${a.reason}` : ""}</p>
              </div>
              <span className={cn("rounded-badge px-2 py-0.5 text-tiny font-semibold uppercase tracking-wide", a.status === "scheduled" ? "border-primary/30 bg-primary/10 text-primary border" : a.status === "completed" ? "border-success/30 bg-success/10 text-success border" : "border-border/60 bg-muted/30 text-muted-foreground border")}>{a.status}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={() => completeAppointment(a.id)} className="tap-target inline-flex items-center justify-center rounded-button border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/15"><Check className="h-4 w-4" />Mark done</button>
              <button type="button" onClick={() => cancelAppointment(a.id)} className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50"><X className="h-4 w-4" />Cancel</button>
            </div>
          </div>
        ))}
        {!items.length ? <div className="rounded-card border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">Tidak ada janji temu.</div> : null}
      </div>
    </section>
  );
}
