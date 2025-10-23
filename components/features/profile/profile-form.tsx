"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AtSign, Home, Phone } from "lucide-react";
import { useProfileStore } from "./store";

type ProfileFormProps = {
  loading?: boolean;
};

export function ProfileForm({ loading }: ProfileFormProps) {
  const [hydrated, setHydrated] = useState(false);
  const profile = useProfileStore((state) => state.profile);
  const [email, setEmail] = useState("pasien@medlink.id");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [address, setAddress] = useState("Jl. Melati No. 12, Jakarta Selatan");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    }
  }, [profile?.email]);

  if (loading || !hydrated) {
    return (
      <section className="rounded-card border border-border/60 bg-card p-5 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted/50" />
        <div className="mt-4 space-y-3">
          <div className="h-12 w-full animate-pulse rounded bg-muted/30" />
          <div className="h-12 w-full animate-pulse rounded bg-muted/30" />
          <div className="h-20 w-full animate-pulse rounded bg-muted/30" />
        </div>
      </section>
    );
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-card border border-border/60 bg-card p-5 shadow-sm"
    >
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Informasi kontak</h2>
        <span className="text-xs text-muted-foreground">Disinkronkan dengan marketplace & resep</span>
      </header>
      <form className="mt-4 space-y-3" aria-label="Formulir informasi kontak">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Email</span>
          <div className="flex items-center gap-2 rounded-card border border-border/60 bg-muted/20 px-3 py-2">
            <AtSign className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Nomor telepon</span>
          <div className="flex items-center gap-2 rounded-card border border-border/60 bg-muted/20 px-3 py-2">
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Alamat pengiriman</span>
          <div className="flex items-start gap-2 rounded-card border border-border/60 bg-muted/20 px-3 py-2">
            <Home className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
            <textarea
              rows={3}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full resize-none bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </label>
        <p className="text-xs text-muted-foreground">
          Informasi ini digunakan saat checkout marketplace dan pengiriman obat elektronik.
        </p>
      </form>
    </motion.section>
  );
}
