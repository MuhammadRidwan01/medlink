"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useMarketplaceCart } from "@/components/features/marketplace/store";
import { MOCK_PRODUCTS, type MarketplaceProduct } from "@/components/features/marketplace/data";
import { useToast } from "@/components/ui/use-toast";
import type { OrderItem } from "./data";

type ReorderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  orderId: string;
};

type QuantityMap = Record<string, number>;

function resolveProduct(orderItem: OrderItem): MarketplaceProduct {
  const match = MOCK_PRODUCTS.find((product) => product.id === orderItem.productId);
  if (match) {
    return match;
  }

  return {
    id: orderItem.productId,
    slug: orderItem.productId,
    name: orderItem.name,
    shortDescription: orderItem.detail,
    longDescription: orderItem.detail,
    price: orderItem.price,
    imageUrl: orderItem.imageUrl,
    categories: ["Obat"],
    tags: ["reorder"],
    rating: 4.5,
    ratingCount: 10,
    inventoryStatus: "in-stock",
  };
}

export function ReorderDialog({ open, onOpenChange, items, orderId }: ReorderDialogProps) {
  const { toast } = useToast();
  const [quantities, setQuantities] = useState<QuantityMap>({});
  const addItem = useMarketplaceCart((state) => state.addItem);
  const updateQuantity = useMarketplaceCart((state) => state.updateQuantity);
  const toggleCart = useMarketplaceCart((state) => state.toggle);

  useEffect(() => {
    if (open) {
      const initial: QuantityMap = {};
      items.forEach((item) => {
        initial[item.id] = item.quantity;
      });
      setQuantities(initial);
      const timer = setTimeout(() => {
        const firstButton = document.getElementById("reorder-confirm-button");
        firstButton?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, items]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (quantities[item.id] ?? item.quantity) * item.price,
        0,
      ),
    [items, quantities],
  );

  const handleAdjust = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleConfirm = () => {
    items.forEach((item) => {
      const quantity = quantities[item.id] ?? item.quantity;
      if (quantity <= 0) return;
      const product = resolveProduct(item);
      addItem(product);
      updateQuantity(product.id, quantity);
    });
    toggleCart(true);
    toast({
      title: "Produk ditambahkan",
      description: `Pesanan ${orderId} ditambahkan ke keranjang.`,
    });
    onOpenChange(false);
  };

  const content = (
    <motion.div
      key="reorder-dialog"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="pointer-events-auto mt-auto w-full max-w-lg rounded-t-[24px] border border-border/60 bg-background shadow-xl lg:mt-0 lg:max-w-xl lg:rounded-[24px]"
    >
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <Dialog.Title className="text-base font-semibold text-foreground">
            Reorder pesanan
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground">
            Sesuaikan jumlah sebelum menambahkan ke keranjang.
          </Dialog.Description>
        </div>
        <Dialog.Close asChild>
          <button
            type="button"
            className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:bg-muted/60"
            aria-label="Tutup dialog reorder"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </Dialog.Close>
      </header>

      <div className="max-h-[420px] space-y-3 overflow-y-auto px-6 py-4">
        {items.map((item) => {
          const quantity = quantities[item.id] ?? item.quantity;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-card border border-border/60 bg-muted/30 p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjust(item.id, -1)}
                  className="tap-target rounded-full border border-border/60 bg-background p-2 text-muted-foreground transition hover:bg-muted/40"
                  aria-label={`Kurangi ${item.name}`}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-[36px] text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleAdjust(item.id, 1)}
                  className="tap-target rounded-full border border-border/60 bg-background p-2 text-muted-foreground transition hover:bg-muted/40"
                  aria-label={`Tambah ${item.name}`}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <p className="w-20 text-right text-sm font-semibold text-foreground">
                {formatCurrency(item.price * quantity)}
              </p>
            </div>
          );
        })}
      </div>

      <footer className="safe-area-bottom space-y-3 border-t border-border/60 bg-muted/20 px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Estimasi total</span>
          <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
        </div>
        <button
          id="reorder-confirm-button"
          type="button"
          onClick={handleConfirm}
          className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Tambahkan ke keranjang
        </button>
      </footer>
    </motion.div>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <>
            <Dialog.Overlay asChild>
              <motion.div
                key="reorder-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                key="reorder-container"
                className="fixed inset-0 z-50 flex flex-col justify-end px-4 py-6 lg:items-center lg:justify-center lg:px-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {content}
              </motion.div>
            </Dialog.Content>
          </>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
