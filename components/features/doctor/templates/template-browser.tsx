"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { NoteTemplate } from "./mock-data";
import { TemplateCard } from "./template-card";

type TemplateBrowserProps = {
  templates: NoteTemplate[];
  onSelect: (template: NoteTemplate) => void;
};

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

export function TemplateBrowser({ templates, onSelect }: TemplateBrowserProps) {
  const specialties = useMemo(() => unique(templates.map((tpl) => tpl.specialty)), [templates]);
  const tags = useMemo(() => unique(templates.flatMap((tpl) => tpl.tags)), [templates]);

  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebouncedValue(searchTerm, 250);

  const filtered = useMemo(() => {
    return templates.filter((tpl) => {
      const matchSpecialty = !activeSpecialty || tpl.specialty === activeSpecialty;
      const matchTags =
        activeTags.length === 0 || activeTags.every((tag) => tpl.tags.includes(tag));
      const term = debouncedSearch.trim().toLowerCase();
      const matchSearch =
        !term ||
        `${tpl.title} ${tpl.specialty} ${tpl.tags.join(" ")}`
          .toLowerCase()
          .includes(term);
      return matchSpecialty && matchTags && matchSearch;
    });
  }, [templates, activeSpecialty, activeTags, debouncedSearch]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  return (
    <section className="space-y-4 rounded-card border border-border/60 bg-card p-4 shadow-sm">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          Filter template catatan
        </div>
        <label className="flex w-full items-center gap-2 rounded-card border border-border/60 bg-muted/30 px-3 py-2 text-sm shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring lg:w-72">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="tap-target w-full bg-transparent text-sm outline-none"
            placeholder="Cari template..."
            aria-label="Cari template catatan"
          />
        </label>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSpecialty(null)}
          className={cn(
            "tap-target rounded-badge border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition",
            activeSpecialty === null
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30",
          )}
          aria-pressed={activeSpecialty === null}
        >
          Semua Spesialis
        </button>
        {specialties.map((specialty) => (
          <button
            key={specialty}
            type="button"
            onClick={() => setActiveSpecialty(specialty === activeSpecialty ? null : specialty)}
            className={cn(
              "tap-target rounded-badge border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition",
              activeSpecialty === specialty
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/30",
            )}
            aria-pressed={activeSpecialty === specialty}
          >
            {specialty}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "tap-target rounded-badge border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
                active
                  ? "border-secondary bg-secondary/10 text-secondary shadow-sm"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:border-secondary/30",
              )}
              aria-pressed={active}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${activeSpecialty ?? "all"}-${activeTags.join(",")}-${debouncedSearch}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} onSelect={onSelect} />
          ))}
          {!filtered.length ? (
            <div className="col-span-full rounded-card border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Tidak ada template yang cocok. Ubah filter untuk melihat opsi lain.
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
