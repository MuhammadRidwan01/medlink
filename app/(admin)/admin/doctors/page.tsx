"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DoctorsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Array<{ id: string; specialty: string | null; license_no: string | null; is_active: boolean; created_at: string }>>([]);
  const [specialty, setSpecialty] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clinical/doctors");
        const data = await res.json();
        setDoctors(data?.doctors || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onActivate = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/clinical/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty: specialty || null, license_no: licenseNo || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal menyimpan");
      setMsg("Akun dokter aktif.");
      // refresh list
      const list = await fetch("/api/clinical/doctors").then((r) => r.json());
      setDoctors(list?.doctors || []);
    } catch (e: any) {
      setMsg(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6">
      <h1 className="text-xl font-semibold">Manajemen Dokter</h1>

      <section className="mt-4 rounded-card border border-border/60 bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Aktifkan Akun Dokter Saya</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spesialisasi</span>
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="tap-target w-full rounded-input border border-border/70 bg-background px-3 py-2 text-sm shadow-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No. Lisensi</span>
            <input value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} className="tap-target w-full rounded-input border border-border/70 bg-background px-3 py-2 text-sm shadow-sm" />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.98 }} disabled={saving} onClick={onActivate} className="tap-target rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md disabled:opacity-60">{saving ? "Menyimpan…" : "Aktifkan"}</motion.button>
          {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
        </div>
      </section>

      <section className="mt-6 rounded-card border border-border/60 bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Daftar Dokter Aktif</h2>
        {loading ? (
          <div className="mt-3 text-sm text-muted-foreground">Memuat…</div>
        ) : doctors.length ? (
          <ul className="mt-3 divide-y divide-border/60">
            {doctors.map((d) => (
              <li key={d.id} className="py-2 text-sm">
                <div className="font-semibold">{d.id}</div>
                <div className="text-muted-foreground">{[d.specialty, d.license_no].filter(Boolean).join(" • ")}</div>
                <div className="text-xs text-muted-foreground">Aktif: {d.is_active ? "Ya" : "Tidak"} • {new Date(d.created_at).toLocaleString("id-ID")}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-muted-foreground">Belum ada data.</div>
        )}
      </section>
    </div>
  );
}
