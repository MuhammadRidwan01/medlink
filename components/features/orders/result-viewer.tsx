"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import { ClipboardList, Image as ImageIcon, Timer } from "lucide-react";
import type { ClinicalOrder } from "./clinical-store";
import { ImageViewer } from "./image-viewer";
import { ReportCard } from "./report-card";

const standardEase = cubicBezier(0.2, 0.8, 0.2, 1);

type Props = {
  order: ClinicalOrder;
  onUpdateReport: (next: string) => void;
};

export function ResultViewer({ order, onUpdateReport }: Props) {
  const [tab, setTab] = useState<"image" | "report" | "timeline">(order.kind === "imaging" ? "image" : "report");
  const indicator = useMemo(() => ({ layoutId: "result-tab", transition: { duration: 0.16, ease: standardEase } }), []);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">
      <aside className="space-y-3 rounded-card border border-border/60 bg-card p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order</p>
          <p className="text-sm font-semibold text-foreground">{order.id}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-card border border-border/60 bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground">Tipe</p>
            <p className="font-semibold capitalize">{order.kind}</p>
          </div>
          <div className="rounded-card border border-border/60 bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-semibold capitalize">{order.status}</p>
          </div>
          <div className="rounded-card border border-border/60 bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground">Pasien</p>
            <p className="font-semibold">{order.patient}</p>
          </div>
          <div className="rounded-card border border-border/60 bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground">Tanggal</p>
            <p className="font-semibold">{new Date(order.date).toLocaleString("id-ID")}</p>
          </div>
        </div>
      </aside>

      <section className="flex min-h-[420px] flex-col">
        <div className="flex items-center gap-2 rounded-button border border-border/60 bg-card p-1 shadow-sm">
          {([
            { key: "image", label: "Image", icon: ImageIcon },
            { key: "report", label: "Report", icon: ClipboardList },
            { key: "timeline", label: "Timeline", icon: Timer },
          ] as const).map((t) => {
            const isActive = tab === (t.key as "image" | "report" | "timeline");
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                className="relative flex-1 rounded-button px-4 py-2 text-sm font-semibold"
                onClick={() => setTab(t.key)}
                role="tab"
                aria-selected={isActive}
              >
                {isActive ? <motion.span {...indicator} className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-primary" /> : null}
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon className={isActive ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex-1 overflow-hidden rounded-card border border-border/60 bg-card p-4 shadow-sm">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "image" && order.kind === "imaging" ? (
              <motion.div key="image" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16, ease: standardEase }} className="h-full">
                {order.images?.length ? (
                  <ImageViewer src={order.images[0]!} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Tidak ada gambar</div>
                )}
              </motion.div>
            ) : null}
            {tab === "report" ? (
              <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16, ease: standardEase }}>
                <ReportCard aiSummary={order.aiSummary} initialReport={order.report} onChange={onUpdateReport} />
              </motion.div>
            ) : null}
            {tab === "timeline" ? (
              <motion.div key="timeline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16, ease: standardEase }} className="space-y-2 text-sm">
                {order.timeline?.map((t) => (
                  <div key={t.id} className="rounded-card border border-border/60 bg-muted/30 p-2">
                    <p className="font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.timestamp).toLocaleString("id-ID")}</p>
                  </div>
                ))}
                {!order.timeline?.length ? <div className="text-muted-foreground">Tidak ada timeline</div> : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
