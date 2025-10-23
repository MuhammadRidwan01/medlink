"use client";

import { useEffect } from "react";

declare global {
  interface Window { __ANALYTICS_DEMO?: boolean }
}

export function SeedBootstrap() {
  useEffect(() => {
    const apply = process.env.NEXT_PUBLIC_APPLY_MOCK_SEEDS === "true";
    if (!apply || typeof window === "undefined") return;
    const resetOnBoot = process.env.NEXT_PUBLIC_RESET_ON_BOOT === "true";
    const analyticsDemo = process.env.NEXT_PUBLIC_ANALYTICS_DEMO === "true";
    if (analyticsDemo) {
      window.__ANALYTICS_DEMO = true;
    }
    (async () => {
      try {
        const res = await fetch("/mock-seed.json", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const ls: Record<string, unknown> = json.localStorage || {};
        const ss: Record<string, unknown> = json.sessionStorage || {};

        if (resetOnBoot) {
          for (const key of Object.keys(ls)) {
            try { localStorage.removeItem(key); } catch {}
          }
          for (const key of Object.keys(ss)) {
            try { sessionStorage.removeItem(key); } catch {}
          }
        }

        for (const [k, v] of Object.entries(ls)) {
          try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
        }
        for (const [k, v] of Object.entries(ss)) {
          try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {}
        }

        // mark applied with version if available
        try {
          const verRes = await fetch("/mock-seed.version", { cache: "no-store" });
          if (verRes.ok) {
            const ver = await verRes.text();
            localStorage.setItem("ml-seeds-applied", ver.trim());
          } else {
            localStorage.setItem("ml-seeds-applied", String(Date.now()));
          }
        } catch {}
      } catch {
        // silent fail in demo mode
      }
    })();
  }, []);
  return null;
}

