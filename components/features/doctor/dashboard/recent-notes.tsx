"use client";

import { motion } from "framer-motion";
import { CalendarClock, FolderOpen } from "lucide-react";
import type { DoctorNote } from "./mock-data";

type RecentNotesProps = {
  notes: DoctorNote[];
};

export function RecentNotes({ notes }: RecentNotesProps) {
  if (!notes.length) {
    return (
      <section className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
        <header className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Catatan terbaru</h2>
        </header>
        <p className="mt-3 text-sm text-muted-foreground">
          Belum ada catatan konsultasi untuk ditampilkan.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-foreground">Catatan terbaru</h2>
        </div>
        <span className="text-xs text-muted-foreground">5 catatan terakhir</span>
      </header>

      <ul className="mt-4 space-y-3">
        {notes.slice(0, 5).map((note, index) => (
          <motion.li
            key={note.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1], delay: index * 0.03 }}
            className="rounded-card border border-border/60 bg-muted/30 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{note.title}</p>
                <p className="text-xs text-muted-foreground">Pasien: {note.patient}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-badge border border-border/60 bg-card/80 px-2 py-1 text-[11px] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                {new Date(note.timestamp).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-badge border border-primary/20 bg-primary/5 px-2.5 py-1 font-semibold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
