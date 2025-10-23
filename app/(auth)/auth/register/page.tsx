"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { registerAction } from "../actions";

type RegisterFormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<RegisterFormState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setFormError("Semua kolom wajib diisi.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError("Kata sandi dan konfirmasi tidak sesuai.");
      return;
    }

    if (form.password.length < 8) {
      setFormError("Kata sandi minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    setFormError(null);

    const result = await registerAction({
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
    });

    if (!result.ok) {
      setFormError(result.message);
      toast({
        title: "Registrasi gagal",
        description: result.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Akun dibuat",
      description: "Silakan cek email Anda untuk verifikasi.",
    });

    setTimeout(() => {
      router.replace("/auth/login");
    }, 200);
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center">
        <h1>Daftar</h1>
        <p className="text-small text-muted-foreground">
          Buat akun pasien untuk memulai konsultasi dengan dokter pilihan Anda.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="fullName" className="flex items-center gap-2 text-small font-medium text-muted-foreground">
            <User className="h-4 w-4 text-primary" aria-hidden />
            Nama lengkap
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nama sesuai KTP"
            value={form.fullName}
            onChange={(event) => {
              setFormError(null);
              setForm((prev) => ({ ...prev, fullName: event.target.value }));
            }}
            className="tap-target w-full rounded-input border border-input bg-background px-4 py-3 text-body shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="register-email" className="flex items-center gap-2 text-small font-medium text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="nama@medlink.id"
            value={form.email}
            onChange={(event) => {
              setFormError(null);
              setForm((prev) => ({ ...prev, email: event.target.value }));
            }}
            className="tap-target w-full rounded-input border border-input bg-background px-4 py-3 text-body shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="register-password" className="flex items-center gap-2 text-small font-medium text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" aria-hidden />
              Kata sandi
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(event) => {
                  setFormError(null);
                  setForm((prev) => ({ ...prev, password: event.target.value }));
                }}
                className="tap-target w-full rounded-input border border-input bg-background px-4 py-3 pr-12 text-body shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="interactive tap-target absolute inset-y-1 right-1 flex h-10 w-10 items-center justify-center rounded-button text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="register-confirm" className="flex items-center gap-2 text-small font-medium text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" aria-hidden />
              Konfirmasi kata sandi
            </label>
            <input
              id="register-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi"
              value={form.confirmPassword}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, confirmPassword: event.target.value }));
              }}
              className="tap-target w-full rounded-input border border-input bg-background px-4 py-3 text-body shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              minLength={8}
              required
            />
          </div>
        </div>
        {formError ? (
          <p className="rounded-card border border-danger/20 bg-danger/10 px-3 py-2 text-small text-danger">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="interactive tap-target inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Membuat akun..." : "Buat akun"}
        </button>
      </form>
      <motion.p
        className="text-center text-small text-muted-foreground"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.02 }}
      >
        Sudah punya akun?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
        >
          Masuk
        </Link>
      </motion.p>
    </motion.div>
  );
}
