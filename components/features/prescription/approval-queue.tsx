"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getCurrentDrafts, subscribeToDrafts, approveDraft, rejectDraft, type DraftRecord } from "./store";
import { RxPreviewCard } from "./rx-preview-card";
import { DraftStatusBadge } from "./draft-status-badge";
import { ApproveRejectDialog } from "./approve-reject-dialog";

export function ApprovalQueue() {
  const [drafts, setDrafts] = useState<DraftRecord[]>(getCurrentDrafts());
  const awaiting = useMemo(() => drafts.filter((d) => d.status === "awaiting_approval"), [drafts]);
  const [selectedId, setSelectedId] = useState<string | null>(awaiting[0]?.id ?? null);
  const selected = useMemo(() => awaiting.find((d) => d.id === selectedId) ?? null, [awaiting, selectedId]);
  const [dlg, setDlg] = useState<{ mode: "approve" | "reject"; open: boolean }>({ mode: "approve", open: false });
  const [liveMsg, setLiveMsg] = useState("");

  useEffect(() => subscribeToDrafts(setDrafts), []);
  useEffect(() => {
    if (!selected && awaiting.length) setSelectedId(awaiting[0].id);
  }, [awaiting, selected]);

  // Keyboard shortcuts
  const onKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selected) return;
    if (e.key.toLowerCase() === "a") {
      e.preventDefault();
      setDlg({ mode: "approve", open: true });
    }
    if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      setDlg({ mode: "reject", open: true });
    }
  }, [selected]);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2" onKeyDown={onKey}>
      <div className="rounded-card border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Menunggu persetujuan</div>
        <div className="max-h-[540px] overflow-y-auto">
          {awaiting.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              className={cn(
                "tap-target block w-full text-left transition",
                "border-b border-border/60 px-3 py-3 hover:bg-muted/30",
                selectedId === d.id && "bg-primary/5",
              )}
              aria-current={selectedId === d.id}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{d.patientName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString("id-ID")}</div>
                </div>
                <DraftStatusBadge status={d.status} />
              </div>
            </button>
          ))}
          {!awaiting.length ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada antrian.</div>
          ) : null}
        </div>
      </div>

      <div>
        {selected ? (
          <div className="space-y-4">
            <RxPreviewCard draft={selected} />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="tap-target inline-flex items-center justify-center rounded-button border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setDlg({ mode: "reject", open: true })}
              >
                Tolak (R)
              </button>
              <button
                type="button"
                className="tap-target inline-flex items-center justify-center rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setDlg({ mode: "approve", open: true })}
              >
                Setujui (A)
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">Pilih item untuk melihat detail.</div>
        )}
      </div>

      <ApproveRejectDialog
        open={dlg.open}
        mode={dlg.mode}
        onClose={() => setDlg((d) => ({ ...d, open: false }))}
        onConfirm={(note) => {
          if (!selected) return;
          if (dlg.mode === "approve") {
            approveDraft(selected.id, note);
            setLiveMsg(`Resep untuk ${selected.patientName} disetujui`);
          } else {
            rejectDraft(selected.id, note);
            setLiveMsg(`Resep untuk ${selected.patientName} ditolak`);
          }
          setDlg((d) => ({ ...d, open: false }));
        }}
      />
      <span className="sr-only" aria-live="polite">{liveMsg}</span>
    </section>
  );
}
