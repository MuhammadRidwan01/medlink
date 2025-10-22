"use client";

import { useId } from "react";
import { Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentOutcome } from "./store";

type TestSwitchesProps = {
  outcome: PaymentOutcome;
  onOutcomeChange: (outcome: PaymentOutcome) => void;
  className?: string;
};

const options: Array<{ value: PaymentOutcome; label: string; description: string }> = [
  {
    value: "success",
    label: "Force Success",
    description: "Simulasikan pembayaran berhasil dalam 1.5 detik.",
  },
  {
    value: "failed",
    label: "Force Failed",
    description: "Paksa transaksi gagal untuk menguji retry.",
  },
  {
    value: "pending",
    label: "Keep Pending",
    description: "Tahan status menunggu hingga pengguna cek ulang.",
  },
];

export function TestSwitches({ outcome, onOutcomeChange, className }: TestSwitchesProps) {
  const groupId = useId();

  return (
    <section
      className={cn(
        "rounded-card border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground",
        className,
      )}
      aria-labelledby={`${groupId}-title`}
    >
      <header className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-button bg-primary/10 text-primary">
          <Beaker className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p id={`${groupId}-title`} className="text-sm font-semibold text-primary">
            Test Switches
          </p>
          <p>Hanya tampil saat pengembangan. Atur hasil mock pembayaran.</p>
        </div>
      </header>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {options.map((option) => {
          const isActive = outcome === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onOutcomeChange(option.value)}
              className={cn(
                "tap-target flex h-full flex-col justify-between rounded-card border px-3 py-2 text-left transition-all duration-fast ease-out",
                isActive
                  ? "border-primary bg-card text-foreground shadow-sm"
                  : "border-border/60 bg-card/60 text-muted-foreground hover:border-primary/30",
              )}
              aria-pressed={isActive}
            >
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              <span className="mt-1 text-xs">{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
