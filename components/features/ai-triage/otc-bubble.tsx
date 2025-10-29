"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle2, ShoppingCart } from "lucide-react";
import { useMarketplaceCart } from "@/components/features/marketplace/store";
import { useRouter } from "next/navigation";

type OTCSuggestion = {
  name: string;
  code: string;
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
  const addToCart = useMarketplaceCart((state) => state.addItem);

  const handleAddToCart = () => {
    // Add all OTC medications to cart
    suggestions.forEach((med) => {
      // Mock product - in production, fetch from products database
      addToCart({
        id: med.code,
        name: `${med.name} ${med.strength}`,
        price: 15000, // Mock price
        quantity: 1,
        image: "/placeholder-med.png",
      });
    });

    // Navigate to marketplace
    router.push("/patient/marketplace");
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
            <h4 className="text-sm font-semibold text-foreground">
              Rekomendasi Obat OTC
            </h4>
            <p className="text-xs text-muted-foreground">
              Tersedia tanpa resep dokter
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {suggestions.map((med, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border/50 bg-background/50 p-3"
            >
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
                  <p className="flex-1 text-muted-foreground">
                    {med.rationale}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddToCart}
          className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg"
        >
          <ShoppingCart className="h-4 w-4" />
          Tambah ke Keranjang & Checkout
        </button>
      </div>

      {timestamp && (
        <div className="text-right text-tiny text-muted-foreground">
          {timestamp}
        </div>
      )}
    </motion.div>
  );
}
