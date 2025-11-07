"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAddSuggestionsToCart } from "./use-add-suggestions-to-cart";

type OTCSuggestion = {
  name: string;
  code?: string;
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
  notes: string;
  rationale: string;
};

type OTCBubbleProps = {
  suggestions: OTCSuggestion[];
  timestamp?: string;
};

export function OTCBubble({ suggestions, timestamp }: OTCBubbleProps) {
  const router = useRouter();
  const addSuggestions = useAddSuggestionsToCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddToCart = async () => {
    if (isSubmitting || suggestions.length === 0) {
      return;
    }
    setIsSubmitting(true);
    const { added, failed } = await addSuggestions(suggestions, {
      syncCheckout: true,
      replaceCart: true,
    });
    setIsSubmitting(false);
    if (failed.length) {
      console.warn("[triage] produk OTC tidak ditemukan:", failed);
    }
    if (added > 0) {
      router.push("/patient/checkout");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-full max-w-2xl flex-col gap-2"
    >
      <div className="rounded-card border border-primary/20 bg-gradient-to-br from-primary/5 to-background p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">Rekomendasi Obat OTC</h4>
            <p className="text-xs text-muted-foreground">Tersedia tanpa resep dokter</p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((med, idx) => (
            <div key={idx} className="rounded-lg border border-border/50 bg-background/50 p-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h5 className="font-semibold text-foreground">
                    {med.name} {med.strength}
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    {med.dose} • {med.frequency}
                  </p>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{med.duration}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex gap-2">
                  <span className="font-semibold">💡</span>
                  <p className="flex-1 text-muted-foreground">{med.notes}</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold">📋</span>
                  <p className="flex-1 text-muted-foreground">{med.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isSubmitting || suggestions.length === 0}
          className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Tambah ke Keranjang & Checkout
            </>
          )}
        </button>
      </div>

      {timestamp && (
        <div className="text-right text-tiny text-muted-foreground">{timestamp}</div>
      )}
    </motion.div>
  );
}
