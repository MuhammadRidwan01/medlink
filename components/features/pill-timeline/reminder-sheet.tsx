"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AlarmClock, Clock, Minus, Plus, Sunrise, Sun, Sunset, MoonStar, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ReminderSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (time: string, offsetMinutes: number) => void;
  anchorLabel: string;
  initialTime: string;
  initialOffset: number;
};

const presetTimes = [
  { value: "06:00", label: "Pagi", icon: Sunrise },
  { value: "12:00", label: "Siang", icon: Sun },
  { value: "18:00", label: "Sore", icon: Sunset },
  { value: "21:00", label: "Malam", icon: MoonStar },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReminderSheet({ open, onOpenChange, onSave, anchorLabel, initialTime, initialOffset }: ReminderSheetProps) {
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [offsetMinutes, setOffsetMinutes] = useState(initialOffset);

  useEffect(() => {
    if (open) {
      setSelectedTime(initialTime);
      setOffsetMinutes(initialOffset);
      setTimeout(() => {
        const input = document.getElementById("reminder-time-input") as HTMLInputElement | null;
        input?.focus();
      }, 16);
    }
  }, [open, initialOffset, initialTime]);

  const occurrences = useMemo(() => {
    if (!selectedTime) return [];
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const today = new Date();
    const base = new Date(today);
    base.setHours(hours);
    base.setMinutes(minutes + offsetMinutes);
    base.setSeconds(0);
    base.setMilliseconds(0);

    const now = new Date();
    const first = new Date(base);
    if (first <= now) {
      first.setDate(first.getDate() + 1);
    }

    const list: Date[] = [];
    for (let i = 0; i < 3; i += 1) {
      const occurrence = new Date(first);
      occurrence.setDate(first.getDate() + i);
      list.push(occurrence);
    }
    return list;
  }, [selectedTime, offsetMinutes]);

  const handleOffsetChange = (delta: number) => {
    setOffsetMinutes((prev) => Math.max(Math.min(prev + delta, 120), -120));
  };

  const handleOffsetInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(value)) {
      setOffsetMinutes(0);
    } else {
      setOffsetMinutes(Math.max(Math.min(value, 120), -120));
    }
  };

  const content = (
    <motion.div
      key="reminder-sheet"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-auto mt-auto w-full max-w-md rounded-t-[24px] border border-border/60 bg-background shadow-xl"
    >
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <div className="mx-auto h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        <header className="flex items-start justify-between gap-3">
          <div>
            <Dialog.Title className="text-base font-semibold text-foreground">
              Pengingat untuk {anchorLabel}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Tentukan waktu dan offset agar pengingat muncul konsisten.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:bg-muted/60"
              aria-label="Tutup pengingat"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </Dialog.Close>
        </header>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Waktu pengingat
          </p>
          <div className="grid grid-cols-2 gap-2">
            {presetTimes.map((preset) => {
              const Icon = preset.icon;
              const isActive = preset.value === selectedTime;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedTime(preset.value)}
                  className={cn(
                    "tap-target inline-flex items-center justify-between gap-2 rounded-card border px-3 py-2 text-sm font-semibold transition-all duration-fast ease-out",
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/30",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {preset.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{preset.value}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 rounded-card border border-border/70 bg-muted/30 px-3 py-2">
            <AlarmClock className="h-5 w-5 text-primary" aria-hidden="true" />
            <input
              id="reminder-time-input"
              type="time"
              value={selectedTime}
              onChange={(event) => setSelectedTime(event.target.value)}
              className="tap-target flex-1 rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Waktu pengingat kustom"
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Offset (menit)
            </p>
            <span className="text-xs text-muted-foreground">-120 hingga +120</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="tap-target rounded-button border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:bg-muted/60"
              onClick={() => handleOffsetChange(-5)}
              aria-label="Kurangi offset 5 menit"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="number"
              value={offsetMinutes}
              onChange={handleOffsetInput}
              className="tap-target w-24 rounded-input border border-border/60 bg-background px-3 py-2 text-center text-sm shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Offset dalam menit"
            />
            <button
              type="button"
              className="tap-target rounded-button border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:bg-muted/60"
              onClick={() => handleOffsetChange(5)}
              aria-label="Tambah offset 5 menit"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-xs text-muted-foreground">(+ artinya penundaan)</span>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pengingat berikutnya
          </p>
          <div className="space-y-2">
            {occurrences.map((occurrence, index) => (
              <div
                key={occurrence.toISOString()}
                className="flex items-center justify-between rounded-card border border-border/40 bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  Hari {index + 1}
                </span>
                <span className="font-semibold text-foreground">{formatTime(occurrence)}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onSave(selectedTime, offsetMinutes);
              onOpenChange(false);
            }}
            className="tap-target inline-flex items-center justify-center rounded-button bg-primary-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-fast ease-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Simpan pengingat
          </button>
          <Dialog.Close asChild>
            <button
              type="button"
              className="tap-target inline-flex items-center justify-center rounded-button border border-border/70 bg-muted/40 px-4 py-3 text-sm font-semibold text-muted-foreground transition-all duration-fast ease-out hover:bg-muted/60"
            >
              Batal
            </button>
          </Dialog.Close>
        </footer>
      </div>
    </motion.div>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                key="reminder-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex flex-col justify-end">
                {content}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
