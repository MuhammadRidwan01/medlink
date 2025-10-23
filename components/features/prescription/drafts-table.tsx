"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DraftStatusBadge } from "./draft-status-badge";
import { bulkSendForApproval, getCurrentDrafts, subscribeToDrafts, type DraftRecord } from "./store";

export function DraftsTable() {
  const [drafts, setDrafts] = useState<DraftRecord[]>(getCurrentDrafts());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [liveMsg, setLiveMsg] = useState("");

  useEffect(() => subscribeToDrafts(setDrafts), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drafts.filter((d) => {
      const statusOk = statusFilter === "all" || d.status === statusFilter;
      const textOk = !q || `${d.patientName} ${d.items.map((i) => i.name).join(" ")}`.toLowerCase().includes(q);
      return statusOk && textOk;
    });
  }, [drafts, statusFilter, query]);

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    filtered.forEach((d) => (next[d.id] = checked));
    setSelected(next);
  };

  const sendSelected = () => {
    if (!selectedIds.length) return;
    bulkSendForApproval(selectedIds);
    setLiveMsg(`${selectedIds.length} draft dikirim untuk persetujuan`);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="tap-target rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Semua</option>
            <option value="draft">Draft</option>
            <option value="awaiting_approval">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </label>
        <label className="flex-1 space-y-1 min-w-[200px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cari</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nama pasien / obat"
            className="tap-target w-full rounded-input border border-border/70 bg-muted/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={!selectedIds.length}
            onClick={sendSelected}
            className={cn(
              "tap-target inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-semibold shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedIds.length
                ? "bg-primary-gradient text-white hover:shadow-lg"
                : "bg-muted/50 text-muted-foreground cursor-not-allowed",
            )}
          >
            Kirim untuk persetujuan
          </button>
        </div>
      </div>

      <div className="rounded-card border border-border/60 bg-card shadow-sm">
        <div className="grid grid-cols-[40px_1fr_1fr_1fr] items-center gap-3 border-b border-border/60 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <input
            type="checkbox"
            className="h-5 w-5"
            aria-label="Pilih semua"
            checked={filtered.length > 0 && filtered.every((d) => selected[d.id])}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <div>Pasien</div>
          <div>Tanggal</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-border/60" aria-live="polite">
          {filtered.map((d) => (
            <motion.div key={d.id} layout className="grid grid-cols-[40px_1fr_1fr_1fr] items-center gap-3 px-3 py-3">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={!!selected[d.id]}
                onChange={(e) => setSelected((s) => ({ ...s, [d.id]: e.target.checked }))}
                aria-label={`Pilih ${d.patientName}`}
              />
              <div>
                <div className="text-sm font-semibold text-foreground">{d.patientName}</div>
                {d.status === "rejected" && d.note ? (
                  <div className="text-xs text-danger">Ditolak: {d.note}</div>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString("id-ID")}</div>
              <div>
                <DraftStatusBadge status={d.status} />
              </div>
            </motion.div>
          ))}
          {!filtered.length ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada draft.</div>
          ) : null}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{liveMsg}</span>
    </section>
  );
}

