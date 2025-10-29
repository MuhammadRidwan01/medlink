"use client";

import { useEffect, useMemo, useState } from "react";
import { cubicBezier, motion } from "framer-motion";
import { Calendar, Droplet, Mail, MapPin, Phone, Save, User, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useProfileStore } from "./store";

type ProfileFormProps = {
  loading?: boolean;
};

export function ProfileForm({ loading }: ProfileFormProps) {
  const [hydrated, setHydrated] = useState(false);
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const storeLoading = useProfileStore((state) => state.loading);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<"" | "female" | "male" | "unspecified">("");
  const [bloodType, setBloodType] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBusy = loading || !hydrated || storeLoading || submitting;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setName(profile?.name ?? "");
    setEmail(profile?.email ?? "");
    setDob(profile?.dob ?? "");
    setSex((profile?.sex as typeof sex | undefined) ?? "");
    setBloodType(profile?.bloodType ?? "");
    setPhone(profile?.phone ?? "");
    setAddress(profile?.address ?? "");
  }, [
    hydrated,
    profile?.address,
    profile?.bloodType,
    profile?.dob,
    profile?.email,
    profile?.name,
    profile?.phone,
    profile?.sex,
  ]);

  const standardEase = useMemo(() => cubicBezier(0.4, 0, 0.2, 1), []);

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
      transition={{ duration: 0.2, ease: standardEase }}
      className="rounded-card border border-border/60 bg-card p-5 shadow-sm"
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Informasi profil</h2>
          <p className="text-xs text-muted-foreground">
            Data berikut tersimpan di Supabase dan digunakan lintas layanan MedLink.
            Termasuk tinggi dan berat di bagian Tanda Vital.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!hydrated) return;
            setSubmitting(true);
            try {
              await updateProfile({
                name: name.trim() || null,
                email: email.trim() || null,
                dob: dob || null,
                sex: sex || null,
                bloodType: bloodType || null,
                phone: phone.trim() || null,
                address: address.trim() || null,
              });
              toast({
                title: "Profil diperbarui",
                description: "Perubahan berhasil disimpan.",
              });
            } catch (error) {
              console.error("[profile] quick save failed", error);
              toast({
                title: "Gagal menyimpan profil",
                description:
                  error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.",
                variant: "destructive",
              });
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={isBusy}
          className="button-primary min-w-[11rem]"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isBusy ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </header>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Nama lengkap</span>
          <div className="flex items-center gap-2 rounded-input border border-border/60 bg-background px-3 py-2 shadow-sm">
            <User className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              placeholder="Nama sesuai identitas"
              disabled={isBusy}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Email</span>
          <div className="flex items-center gap-2 rounded-input border border-border/60 bg-background px-3 py-2 shadow-sm">
            <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              placeholder="contoh@medlink.id"
              disabled={isBusy}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Tanggal lahir</span>
          <div className="flex items-center gap-2 rounded-input border border-border/60 bg-background px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              disabled={isBusy}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Jenis kelamin</span>
          <div className="relative flex items-center gap-2 rounded-input border border-border/60 bg-background px-3 py-2 pr-9 shadow-sm">
            <User className="h-4 w-4 rotate-90 text-primary" aria-hidden="true" />
            <select
              value={sex}
              onChange={(event) =>
                setSex(event.target.value as typeof sex)
              }
              className="w-full appearance-none bg-transparent text-sm text-foreground outline-none"
              disabled={isBusy}
            >
              <option value="">Pilih jenis kelamin</option>
              <option value="female">Wanita</option>
              <option value="male">Pria</option>
              <option value="unspecified">Tidak disebutkan</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-semibold text-muted-foreground">Golongan darah</span>
          <div className="relative flex items-center gap-2 rounded-input border border-border/60 bg-background px-3 py-2 pr-9 shadow-sm">
            <Droplet className="h-4 w-4 text-primary" aria-hidden="true" />
            <select
              value={bloodType}
              onChange={(event) => setBloodType(event.target.value)}
              className="w-full appearance-none bg-transparent text-sm text-foreground outline-none"
              disabled={isBusy}
            >
              <option value="">Pilih golongan darah</option>
              <option value="A">A</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B">B</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB">AB</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O">O</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-muted-foreground">Nomor telepon</span>
          <div className="flex items-center gap-2 rounded-input border border-border/60 bg-background px-3 py-2 shadow-sm">
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
              placeholder="+62 ..."
              disabled={isBusy}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          <span className="font-semibold text-muted-foreground">Alamat lengkap</span>
          <div className="flex items-start gap-2 rounded-input border border-border/60 bg-background px-3 py-2 shadow-sm">
            <MapPin className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
            <textarea
              rows={3}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full resize-none bg-transparent text-sm text-foreground outline-none"
              placeholder="Contoh: Jl. Melati No. 12, Jakarta Selatan"
              disabled={isBusy}
            />
          </div>
        </label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Perubahan akan tersimpan di basis data Supabase dan diselaraskan otomatis ke marketplace,
        riwayat konsultasi, serta sistem pengingat obat Anda.
      </p>
    </motion.section>
  );
}
