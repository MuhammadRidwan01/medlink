"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "medlink-preferred-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [initialized, setInitialized] = useState(false);

  const applyTheme = useCallback((value: Theme, persist = true) => {
    const root = document.documentElement;
    const isDark = value === "dark";
    root.classList.toggle("dark", isDark);
    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // ignore storage issues such as private mode
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const preferred: Theme = stored ?? (mediaQuery.matches ? "dark" : "light");
    setTheme(preferred);
    applyTheme(preferred, Boolean(stored));
    setInitialized(true);

    const handleChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
      const next: Theme = event.matches ? "dark" : "light";
      setTheme(next);
      applyTheme(next, false);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "interactive tap-target inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition hover:border-border hover:text-foreground",
        className,
      )}
      aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      aria-pressed={theme === "dark"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      <span className="hidden sm:inline">{initialized ? (theme === "dark" ? "Mode terang" : "Mode gelap") : "Tema"}</span>
    </button>
  );
}
