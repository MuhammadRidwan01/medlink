import { Pill, ShoppingBag, Truck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const marketplaceHighlights = [
  {
    icon: ShoppingBag,
    title: "Produk Populer",
    description: "Temukan obat & wellness kit terpercaya dari mitra apotek.",
  },
  {
    icon: Truck,
    title: "Pengiriman Cepat",
    description: "Pengantaran same-day di kota besar, aman dan terjaga.",
  },
  {
    icon: Pill,
    title: "Interaksi Obat Cerdas",
    description: "AI akan memeriksa interaksi obat sebelum checkout.",
  },
] as const;

export default function MarketplacePage() {
  return (
    <PageShell
      title="Marketplace Medis"
      subtitle="Belanja kebutuhan kesehatan dengan rekomendasi AI dan apotek terverifikasi."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {marketplaceHighlights.map((item) => (
          <div key={item.title} className="card-surface p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-button bg-accent/10 text-accent">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="text-body font-semibold text-foreground">
                {item.title}
              </h3>
            </div>
            <p className="text-small text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

