"use client";

import { Suspense, type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { loginAction } from "../actions";

type LoginFormState = {
  email: string;
  password: string;
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = searchParams.get("redirect");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    if (!form.email || !form.password) {
      setFormError("Email dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);
    setFormError(null);

    const result = await loginAction({
      email: form.email.trim(),
      password: form.password,
    });

    if (!result.ok) {
      setFormError(result.message);
      toast({
        title: "Login gagal",
        description: result.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Selamat datang kembali!",
      description: "Anda berhasil masuk.",
    });

    // Determine redirect destination
    const role = result.user.full_name?.toLowerCase().includes("doctor") ? "doctor" : "patient";
    const fallbackRoute = role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
    const destination = redirectTo ?? fallbackRoute;

    // Redirect to dashboard
    router.replace(destination);
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center">
        <h1>Masuk</h1>
        <p className="text-small text-muted-foreground">
          Akses triase AI, riwayat medis, dan konsultasi dokter Anda.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-small font-medium text-muted-foreground"
          >
            <Mail className="h-4 w-4 text-primary" aria-hidden />
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@medlink.id"
              value={form.email}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, email: event.target.value }));
              }}
              className="tap-target w-full rounded-input border border-input bg-background px-4 py-3 pr-12 text-body shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              aria-describedby={formError ? "login-error" : undefined}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="flex items-center gap-2 text-small font-medium text-muted-foreground"
          >
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            Kata sandi
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
        {formError ? (
          <p
            id="login-error"
            className="rounded-card border border-danger/20 bg-danger/10 px-3 py-2 text-small text-danger"
          >
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="interactive tap-target inline-flex w-full items-center justify-center gap-2 rounded-button bg-primary-gradient px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <motion.p
        className="text-center text-small text-muted-foreground"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.02 }}
      >
        Belum punya akun?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
        >
          Daftar sekarang
        </Link>
      </motion.p>
    </motion.div>
  );
}

function LoginFallback() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div className="h-48 animate-pulse rounded-card border border-border/60 bg-muted/40" />
      <div className="h-56 animate-pulse rounded-card border border-border/60 bg-muted/30" />
    </motion.div>
  );
}
