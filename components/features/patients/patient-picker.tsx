"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";

export type PatientLite = { id: string; name: string | null; email: string | null; phone: string | null };

type PatientPickerProps = {
  value?: PatientLite | null;
  onChange: (p: PatientLite | null) => void;
  label?: string;
};

export function PatientPicker({ value, onChange, label = "Pilih pasien" }: PatientPickerProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PatientLite[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/patients/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults((data?.patients || []).map((r: any) => ({ id: r.id, name: r.name ?? null, email: r.email ?? null, phone: r.phone ?? null })));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const display = useMemo(() => {
    if (!value) return "Belum dipilih";
    return value.name || value.email || value.id;
  }, [value]);

  return (
    <section className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="rounded-card border border-border/60 bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, email, atau nomor"
            className="tap-target w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground/70" />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Terpilih: <span className="text-foreground font-medium">{display}</span></div>
        <div className="mt-3 space-y-1">
          <AnimatePresence initial={false}>
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-muted-foreground">Mencari…</motion.div>
            ) : results.length ? (
              results.map((r) => (
                <motion.button key={r.id} type="button" onClick={() => onChange(r)}
                  whileTap={{ scale: 0.98 }}
                  className="tap-target w-full rounded-button border border-border/60 bg-background px-3 py-2 text-left text-sm hover:border-primary/30">
                  <div className="font-semibold text-foreground">{r.name || r.email || r.id}</div>
                  <div className="text-xs text-muted-foreground">{[r.email, r.phone].filter(Boolean).join(" • ")}</div>
                </motion.button>
              ))
            ) : query ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-muted-foreground">Tidak ada hasil.</motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
