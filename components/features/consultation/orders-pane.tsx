"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, Plus, Trash2, Stethoscope, TestTube, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { consultationBus } from "./event-bus";
import { MEDICATION_OPTIONS } from "@/components/features/prescription/medication-search";

export type OrderItem = {
  id: string;
  kind: "lab" | "imaging" | "meds";
  label: string;
  detail?: string;
};

type OrdersPaneProps = {
  initialItems?: OrderItem[];
};

export function OrdersPane({ initialItems = [] }: OrdersPaneProps) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [kind, setKind] = useState<OrderItem["kind"]>("meds");
  const [label, setLabel] = useState("");
  const [reorderMode, setReorderMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const dragIndex = useRef<number | null>(null);

  const addItem = useCallback(() => {
    if (!label.trim()) return;
    const next: OrderItem = { id: `order-${Date.now()}`, kind, label: label.trim() };
    setItems((cur) => [...cur, next]);
    setLabel("");
    if (next.kind === "meds") {
      // Emit event to open Draft Prescription prefilled when adding meds via quick add
      const match = MEDICATION_OPTIONS.find(
        (opt) => opt.name.toLowerCase() === next.label.toLowerCase() || opt.code === next.label.toLowerCase(),
      );
      if (match) {
        consultationBus.emit("prescription:add", {
          id: match.id,
          name: match.name,
          code: match.code,
          strengths: match.strengths,
          defaultDose: match.defaultDose,
          defaultFrequency: match.defaultFrequency,
          defaultDuration: match.defaultDuration,
        });
      }
    }
  }, [kind, label]);

  const removeItem = useCallback((id: string) => {
    setItems((cur) => cur.filter((i) => i.id !== id));
  }, []);

  const startDrag = (index: number) => (e: React.DragEvent<HTMLButtonElement>) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from == null || from === index) return;
    setItems((cur) => {
      const next = cur.slice();
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next;
    });
  };

  // Keyboard reorder: press '/' to enter, arrows to move, Enter to exit
  const onKeyList = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "/") {
      e.preventDefault();
      setReorderMode((v) => !v);
      return;
    }
    if (!reorderMode) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setReorderMode(false);
    } else if (e.key === "PageDown" && items.length > 1) {
      e.preventDefault();
      setItems((cur) => move(cur, focusIndex, Math.min(items.length - 1, focusIndex + 1)));
      setFocusIndex((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "PageUp" && items.length > 1) {
      e.preventDefault();
      setItems((cur) => move(cur, focusIndex, Math.max(0, focusIndex - 1)));
      setFocusIndex((i) => Math.max(0, i - 1));
    }
  };

  const icon = (k: OrderItem["kind"]) =>
    k === "lab" ? (
      <TestTube className="h-4 w-4 text-primary" aria-hidden="true" />
    ) : k === "imaging" ? (
      <Stethoscope className="h-4 w-4 text-primary" aria-hidden="true" />
    ) : (
      <Pill className="h-4 w-4 text-primary" aria-hidden="true" />
    );

  const medsOptions = useMemo(() => MEDICATION_OPTIONS.slice(0, 6), []);

  return (
    <motion.div
      key="orders-pane"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-full flex-col gap-4 p-4"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto]">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jenis</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as OrderItem["kind"])}
            className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="meds">Obat</option>
            <option value="lab">Lab</option>
            <option value="imaging">Imaging</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nama</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem();
            }}
            placeholder={kind === "meds" ? "cth: Paracetamol" : kind === "lab" ? "cth: CBC" : "cth: Chest X-ray"}
            className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={addItem}
            className="tap-target inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah
          </button>
        </div>
      </div>

      {kind === "meds" ? (
        <div className="rounded-card border border-border/60 bg-card p-3 shadow-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pilihan cepat</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {medsOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setLabel(opt.name);
                  consultationBus.emit("prescription:add", {
                    id: opt.id,
                    name: opt.name,
                    code: opt.code,
                    strengths: opt.strengths,
                    defaultDose: opt.defaultDose,
                    defaultFrequency: opt.defaultFrequency,
                    defaultDuration: opt.defaultDuration,
                  });
                }}
                className="tap-target rounded-card border border-border/60 bg-background px-3 py-2 text-left text-sm font-semibold text-foreground transition hover:border-primary/30 hover:shadow"
              >
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  {opt.name}
                </div>
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">{opt.strengths.join(", ")}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="flex-1 space-y-2 overflow-y-auto pr-1"
        role="list"
        tabIndex={0}
        onKeyDown={onKeyList}
        aria-label="Daftar orders"
      >
        <AnimatePresence initial={false}>
          {items.length ? (
            items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                onDragOver={onDragOver(idx)}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-card border border-border/70 bg-card p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md",
                  reorderMode && idx === focusIndex && "ring-2 ring-primary",
                )}
                role="listitem"
                aria-label={`${item.kind} ${item.label}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <button
                    type="button"
                    className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:text-foreground"
                    draggable
                    aria-label="Geser untuk mengurutkan"
                    onDragStart={startDrag(idx)}
                  >
                    <GripVertical className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {icon(item.kind)}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.kind === "meds" ? "Obat" : item.kind === "lab" ? "Lab" : "Imaging"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.kind === "meds" ? (
                    <button
                      type="button"
                      className="tap-target inline-flex items-center justify-center gap-2 rounded-button border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/15"
                      onClick={() => {
                        const match = MEDICATION_OPTIONS.find(
                          (opt) => opt.name.toLowerCase() === item.label.toLowerCase(),
                        );
                        if (match) {
                          consultationBus.emit("prescription:add", {
                            id: match.id,
                            name: match.name,
                            code: match.code,
                            strengths: match.strengths,
                            defaultDose: match.defaultDose,
                            defaultFrequency: match.defaultFrequency,
                            defaultDuration: match.defaultDuration,
                          });
                        }
                      }}
                    >
                      Masukkan ke Draf
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:text-foreground"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty-orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-card border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground"
            >
              Belum ada order.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  if (from === to) return arr;
  const next = arr.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
