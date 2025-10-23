"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePaymentStore } from "./store";

export function PaymentToastCenter() {
  const { toast } = useToast();
  const activeOrderId = usePaymentStore((s) => s.activeOrderId);
  const order = usePaymentStore((s) => (activeOrderId ? s.orders[activeOrderId] : undefined));
  const lastStatus = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!order) return;
    if (lastStatus.current === order.status) return;
    lastStatus.current = order.status;
    if (order.status === "pending") {
      toast({ title: "Menunggu pembayaran", description: "Kami menunggu konfirmasi dari bank." });
    }
    if (order.status === "success") {
      toast({ title: "Pembayaran berhasil", description: "Resep Anda sedang diproses." });
    }
    if (order.status === "failed") {
      toast({ title: "Pembayaran gagal", description: "Coba kanal lain atau ulangi transaksi." });
    }
  }, [order, toast]);

  return <span className="sr-only" aria-live="polite">{order ? `Status: ${order.status}` : ""}</span>;
}
