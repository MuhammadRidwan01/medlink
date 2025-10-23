"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useMarketplaceCart } from "@/components/features/marketplace/store";
import { cn } from "@/lib/utils";

export function CartSheet() {
  const standardEase = cubicBezier(0.2, 0.8, 0.2, 1);
  const { isOpen, items, toggle, updateQuantity, removeItem, subtotal } = useMarketplaceCart();

  const content = (
    <motion.div
      key="cart-sheet"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.16, ease: standardEase }}
      className="pointer-events-auto h-full w-full max-w-md overflow-hidden border-l border-border/60 bg-background shadow-xl"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <Dialog.Title className="text-base font-semibold text-foreground">Keranjang</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Ringkas belanja Anda sebelum checkout.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/60"
              aria-label="Tutup keranjang"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </Dialog.Close>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              Keranjang Anda kosong. Jelajahi marketplace untuk menambahkan produk.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.product.id} className="flex gap-3 rounded-card border border-border/60 bg-muted/20 p-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-card bg-muted">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex w-full flex-col gap-2">
                  <header className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">Rp {item.product.price.toLocaleString("id-ID")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="tap-target rounded-full border border-border/60 bg-muted/30 p-1.5 text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/50"
                      aria-label={`Hapus ${item.product.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </header>
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 rounded-button border border-border/60 bg-background px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="tap-target rounded-full border border-border/60 p-1 text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/40"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="tap-target rounded-full border border-border/60 p-1 text-muted-foreground transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-muted/40"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {item.conflicts.length ? (
                    <div className="rounded-card border border-warning/40 bg-warning/10 px-2 py-1 text-[11px] text-warning">
                      Produk ini memiliki catatan interaksi dengan profil Anda.
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="border-t border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>Subtotal</span>
            <span>Rp {subtotal().toLocaleString("id-ID")}</span>
          </div>
            <button
              type="button"
              disabled={items.length === 0}
              className={cn(
              "tap-target mt-3 inline-flex w-full items-center justify-center rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition duration-160 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              items.length === 0 && "cursor-not-allowed opacity-60",
            )}
          >
            Lanjutkan ke checkout
          </button>
        </footer>
      </div>
    </motion.div>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={toggle}>
      <AnimatePresence>
        {isOpen ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                key="cart-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: standardEase }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex justify-end">
                {content}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
