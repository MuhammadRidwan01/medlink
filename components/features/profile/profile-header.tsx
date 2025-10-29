"use client";

import { CalendarDays, Droplet, Pencil, UserRound } from "lucide-react";
import { motion } from "framer-motion";
type ProfileHeaderProps = {
  name: string;
  dob: string;
  sex: "Pria" | "Wanita";
  bloodType: string;
  onEdit?: () => void;
  loading?: boolean;
};

export function ProfileHeader({ name, dob, sex, bloodType, onEdit, loading }: ProfileHeaderProps) {
  if (loading) {
    return (
      <section className="patient-panel flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-muted/40" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted/40" />
            <div className="flex gap-3">
              <div className="h-3 w-20 rounded bg-muted/30" />
              <div className="h-3 w-16 rounded bg-muted/30" />
              <div className="h-3 w-24 rounded bg-muted/30" />
            </div>
          </div>
        </div>
        <div className="h-9 w-28 rounded-button bg-muted/30" />
      </section>
    );
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="patient-panel relative flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between"
    >
      <div className="pointer-events-none absolute inset-0 opacity-75">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-primary/12 blur-3xl dark:bg-teal-500/12" />
      </div>
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary shadow-[0_12px_24px_-18px_rgba(6,182,212,0.6)] dark:bg-teal-500/15 dark:text-teal-200">
          <UserRound className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-small text-muted-foreground/80">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              {dob}
            </span>
            <span className="inline-flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
              {sex}
            </span>
            <span className="inline-flex items-center gap-2">
              <Droplet className="h-4 w-4 text-primary" aria-hidden="true" />
              Gol. Darah {bloodType}
            </span>
          </div>
        </div>
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="interactive tap-target inline-flex items-center gap-2 self-start rounded-button border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-primary/35 hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-teal-400/25 dark:bg-teal-500/10 dark:text-teal-100"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Ubah profil
        </button>
      ) : null}
    </motion.section>
  );
}
