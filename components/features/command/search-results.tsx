"use client";

import { useMemo } from "react";
import { fuzzyMatch } from "./fuzzy";
import { CommandItem } from "./command-item";
import type { RouteEntry, EntityEntry, CommandEntry } from "./data";

export type SearchResult = {
  routes: RouteEntry[];
  patients: EntityEntry[];
  doctors: EntityEntry[];
  commands: CommandEntry[];
  indices: number[];
};

export function useSearch(query: string, routes: RouteEntry[], patients: EntityEntry[], doctors: EntityEntry[], commands: CommandEntry[]) {
  return useMemo(() => {
    if (!query.trim()) return { routes: routes.slice(0, 6), patients: patients.slice(0, 3), doctors: doctors.slice(0, 3), commands: commands.slice(0, 3), indices: [] } as SearchResult;
    const calc = <T extends { label: string }>(items: T[]) =>
      items
        .map((i) => ({ i, fm: fuzzyMatch(query, i.label) }))
        .filter((x) => x.fm.score >= 0)
        .sort((a, b) => b.fm.score - a.fm.score)
        .slice(0, 6)
        .map((x) => x.i);
    return {
      routes: calc(routes),
      patients: calc(patients),
      doctors: calc(doctors),
      commands: calc(commands),
      indices: fuzzyMatch(query, query).indices, // reuse for highlighting composition; not used directly here
    } as SearchResult;
  }, [commands, doctors, patients, query, routes]);
}

export function SearchResults({
  routes,
  patients,
  doctors,
  commands,
  activeIndex,
  onPick,
}: {
  routes: RouteEntry[];
  patients: EntityEntry[];
  doctors: EntityEntry[];
  commands: CommandEntry[];
  activeIndex: number;
  onPick: (kind: "route" | "patient" | "doctor" | "command", index: number) => void;
}) {
  const sections: { key: string; title: string; items: Array<RouteEntry | EntityEntry | CommandEntry>; kind: "route" | "patient" | "doctor" | "command" }[] = [
    { key: "routes", title: "Pages", items: routes, kind: "route" },
    { key: "patients", title: "Patients", items: patients, kind: "patient" },
    { key: "doctors", title: "Doctors", items: doctors, kind: "doctor" },
    { key: "commands", title: "Commands", items: commands, kind: "command" },
  ];

  let offset = 0;
  return (
    <div className="space-y-3" role="list">
      {sections.map((section) => {
        const start = offset;
        offset += section.items.length;
        if (!section.items.length) return null;
        return (
          <section key={section.key} className="space-y-2">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h3>
            <div className="grid gap-2">
              {section.items.map((item: RouteEntry | EntityEntry | CommandEntry, idx: number) => {
                const isActive = start + idx === activeIndex;
                const Icon = (item.icon as React.ComponentType<{ className?: string }>);
                return (
                  <CommandItem
                    key={item.id}
                    icon={Icon}
                    label={item.label}
                    meta={item.meta}
                    shortcut={("shortcut" in item ? (item as CommandEntry).shortcut : undefined)}
                    active={isActive}
                    onClick={() => onPick(section.kind, idx)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
