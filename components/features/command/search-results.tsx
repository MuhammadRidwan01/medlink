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

type SectionKind = "route" | "patient" | "doctor" | "command";
type SectionKey = keyof Pick<SearchResult, "routes" | "patients" | "doctors" | "commands">;
type SearchSectionItem = RouteEntry | EntityEntry | CommandEntry;

type SectionConfig = {
  key: SectionKey;
  title: string;
  items: ReadonlyArray<SearchSectionItem>;
  kind: SectionKind;
};

export function useSearch(
  query: string,
  routes: RouteEntry[],
  patients: EntityEntry[],
  doctors: EntityEntry[],
  commands: CommandEntry[],
) {
  return useMemo<SearchResult>(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        routes: routes.slice(0, 6),
        patients: patients.slice(0, 3),
        doctors: doctors.slice(0, 3),
        commands: commands.slice(0, 3),
        indices: [],
      };
    }

    const scoreAndFilter = <T extends { label: string }>(
      items: ReadonlyArray<T>,
      limit: number,
    ): T[] =>
      items
        .map((item) => ({ item, match: fuzzyMatch(trimmed, item.label) }))
        .filter(({ match }) => match.score >= 0)
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, limit)
        .map(({ item }) => item);

    return {
      routes: scoreAndFilter(routes, 6),
      patients: scoreAndFilter(patients, 3),
      doctors: scoreAndFilter(doctors, 3),
      commands: scoreAndFilter(commands, 6),
      indices: fuzzyMatch(trimmed, trimmed).indices, // reuse for highlighting composition; not used directly here
    };
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
  onPick: (kind: SectionKind, index: number) => void;
}) {
  const sections: SectionConfig[] = [
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
              {section.items.map((item, idx) => {
                const isActive = start + idx === activeIndex;
                const Icon = item.icon;
                const meta = "meta" in item ? item.meta : undefined;
                const shortcut =
                  section.kind === "command" ? (item as CommandEntry).shortcut : undefined;
                return (
                  <CommandItem
                    key={item.id}
                    icon={Icon}
                    label={item.label}
                    meta={meta}
                    shortcut={shortcut}
                    active={isActive}
                    onClick={() => onPick(section.kind, start + idx)}
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
