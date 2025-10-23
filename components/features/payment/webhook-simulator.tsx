"use client";

import { useEffect, useRef, useState } from "react";
import { Beaker, X } from "lucide-react";
import { type PaymentOutcome } from "./store";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  orderId: string;
};

export function WebhookSimulator({ orderId }: Props) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<PaymentOutcome>("success");
  const [delay, setDelay] = useState(1200);
  const [isSending, setIsSending] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="rounded-card border border-border/60 bg-muted/20 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="tap-target inline-flex items-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls="webhook-sim-panel"
      >
        <Beaker className="h-4 w-4" aria-hidden="true" />
        Webhook Simulator
      </button>

      {open ? (
        <div
          id="webhook-sim-panel"
          ref={panelRef}
          className="mt-3 space-y-3 rounded-card border border-border/60 bg-card p-3 shadow-sm"
          role="dialog"
          aria-label="Webhook simulator"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Simulasi callback server</p>
              <p className="text-xs text-muted-foreground">Pilih outcome dan tunda eksekusi untuk menguji UI end-to-end.</p>
            </div>
            <button
              type="button"
              className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/40 p-2 text-muted-foreground hover:bg-muted/60"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcome</span>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as PaymentOutcome)}
                className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="success">success</option>
                <option value="failed">failed</option>
                <option value="pending">pending</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delay (ms)</span>
              <input
                type="number"
                min={0}
                max={5000}
                step={50}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={async () => {
                  if (isSending) return;
                  if (outcome === "pending") {
                    toast({
                      title: "Status dibiarkan pending",
                      description: `Tidak ada webhook dikirim. Tunggu ${delay}ms sebelum cek ulang.`,
                    });
                    return;
                  }
                  setIsSending(true);
                  try {
                    if (delay > 0) {
                      await new Promise((resolve) => setTimeout(resolve, delay));
                    }
                    const response = await fetch("/functions/v1/payment-webhook", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ orderId, outcome }),
                    });
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}`);
                    }
                    toast({
                      title: "Webhook dikirim",
                      description: `Outcome: ${outcome} - Delay: ${delay}ms`,
                    });
                  } catch (error) {
                    console.error("Failed to send payment webhook", error);
                    toast({
                      title: "Webhook gagal",
                      description: "Tidak dapat mengirim callback pembayaran.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSending(false);
                  }
                }}
                className="tap-target inline-flex w-full items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
                disabled={isSending}
              >
                {isSending ? "Mengirim..." : "Kirim callback"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
