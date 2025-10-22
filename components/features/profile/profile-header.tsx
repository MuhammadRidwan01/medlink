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
      <section className="flex flex-col gap-4 rounded-card border border-border/60 bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
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
      className="flex flex-col gap-4 rounded-card border border-border/60 bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-small text-muted-foreground">
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
          className="interactive tap-target inline-flex items-center gap-2 self-start rounded-button border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Ubah profil
        </button>
      ) : null}
    </motion.section>
  );
}
