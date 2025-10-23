"use client";

import { Printer, Share2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { downloadElementAsPdfMock } from "./pdf-export";

export function ReceiptActions({ targetId }: { targetId: string }) {
  const { toast } = useToast();
  const doDownload = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    await downloadElementAsPdfMock(el, "medlink-receipt.pdf");
    toast({ title: "Mengunduh bukti pembayaran" });
  };
  const doPrint = () => {
    window.print();
  };
  const doShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "MedLink Receipt", url });
        toast({ title: "Tautan dibagikan" });
        return;
      } catch {
        // fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Tautan disalin" });
    } catch {
      toast({ title: "Gagal menyalin tautan" });
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={doDownload}
        className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50"
      >
        <Download className="h-4 w-4" />
        Download PDF
      </button>
      <button
        type="button"
        onClick={doPrint}
        className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
      <button
        type="button"
        onClick={doShare}
        className="tap-target inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50"
      >
        <Share2 className="h-4 w-4" />
        Share link
      </button>
    </div>
  );
}

