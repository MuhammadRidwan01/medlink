"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CommandInput } from "./command-input";
import { SearchResults, useSearch } from "./search-results";
import { buildCommands, buildRoutes, DOCTORS, PATIENTS } from "./data";
import { KeyboardHints } from "./keyboard-hints";
import { RecentHistory } from "./recent-history";
import { useHistoryStore } from "./history-store";

export function GlobalCommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const pushHistory = useHistoryStore((s) => s.push);
  useEffect(() => {
    // push on navigation
    const label = document.title || pathname;
    pushHistory({ href: pathname, label, at: new Date().toISOString() });
  }, [pathname, pushHistory]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const navigate = useMemo(() => (href: string) => router.push(href), [router]);
  const toggleTheme = () => {
    // simple mock toggle
    document.documentElement.classList.toggle("dark");
  };

  const routes = useMemo(() => buildRoutes(), []);
  const commands = useMemo(() => buildCommands(navigate, toggleTheme), [navigate]);
  const results = useSearch(query, routes, PATIENTS, DOCTORS, commands);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if ((isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k") || e.key.toLowerCase() === "k") {
        e.preventDefault();
        previouslyFocused.current = document.activeElement as HTMLElement;
        setOpen(true);
        setTimeout(() => liveRef.current?.focus(), 0);
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(totalCount(results) - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        pickByIndex(results, active, (href) => {
          setOpen(false);
          router.push(href);
        }, (fn) => {
          setOpen(false);
          fn();
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, open, results, router]);

  useEffect(() => {
    if (!open && previouslyFocused.current) {
      previouslyFocused.current.focus();
    }
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={() => setOpen(false)} />
          <motion.div role="dialog" aria-modal="true" aria-label="Command palette" className="fixed inset-0 z-[61] grid place-items-start overflow-y-auto pt-[10vh]" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}>
            <div className="mx-auto w-full max-w-2xl space-y-3 rounded-card border border-border/60 bg-card p-3 shadow-xl">
              <span ref={liveRef} tabIndex={-1} className="sr-only" aria-live="polite">Command palette opened</span>
              <CommandInput value={query} onChange={(v) => { setQuery(v); setActive(0); }} indices={[]} />
              {query ? (
                <SearchResults
                  routes={results.routes}
                  patients={results.patients}
                  doctors={results.doctors}
                  commands={results.commands}
                  activeIndex={active}
                  onPick={(kind, idx) => {
                    pickByIndex(results, idxWithin(results, kind, idx), (href) => { setOpen(false); router.push(href); }, (fn) => { setOpen(false); fn(); });
                  }}
                />
              ) : (
                <RecentHistory onPick={(href) => { setOpen(false); router.push(href); }} />
              )}
              <KeyboardHints />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function totalCount(r: ReturnType<typeof useSearch>) {
  return r.routes.length + r.patients.length + r.doctors.length + r.commands.length;
}

function idxWithin(r: ReturnType<typeof useSearch>, kind: "route" | "patient" | "doctor" | "command", idx: number) {
  if (kind === "route") return idx;
  if (kind === "patient") return r.routes.length + idx;
  if (kind === "doctor") return r.routes.length + r.patients.length + idx;
  return r.routes.length + r.patients.length + r.doctors.length + idx;
}

function pickByIndex(
  r: ReturnType<typeof useSearch>,
  index: number,
  navigate: (href: string) => void,
  runCommand: (runner: () => void) => void,
) {
  const routes = r.routes;
  const patients = r.patients;
  const doctors = r.doctors;
  const commands = r.commands;
  let offset = 0;
  if (index < offset + routes.length) {
    const item = routes[index - offset]!;
    navigate(item.href);
    return;
  }
  offset += routes.length;
  if (index < offset + patients.length) {
    const item = patients[index - offset]!;
    if (item.href) navigate(item.href);
    return;
  }
  offset += patients.length;
  if (index < offset + doctors.length) {
    const item = doctors[index - offset]!;
    if (item.href) navigate(item.href);
    return;
  }
  offset += doctors.length;
  if (index < offset + commands.length) {
    const item = commands[index - offset]!;
    runCommand(item.run);
  }
}
