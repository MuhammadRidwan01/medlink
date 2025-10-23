#!/usr/bin/env tsx
/*
  Reset script: restores baseline by clearing keys on next boot and re-seeding.
  - Sets NEXT_PUBLIC_RESET_ON_BOOT=true
  - Rebuilds mock-seed.json to baseline
*/

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const publicDir = join(root, "public");
const seedPath = join(publicDir, "mock-seed.json");
const envLocalPath = join(root, ".env.local");

function ensureDir(p: string) {
  try { mkdirSync(p, { recursive: true }); } catch {}
}

function setFlag(key: string, value: string) {
  let current = "";
  try { current = (require("fs").readFileSync(envLocalPath, "utf8") as string) } catch {}
  const lines = current ? current.split(/\r?\n/) : [];
  const map = new Map<string, string>();
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  map.set(key, value);
  const out = Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
  writeFileSync(envLocalPath, out, "utf8");
}

function buildBaseline() {
  return {
    localStorage: {
      "ml-content-store-v1": { articles: [] },
      "ml-schedule-store-v1": { slots: [], appointments: [] },
      "ml-feedback-state-v1": { entries: [] },
    },
    sessionStorage: { "payment-store": { state: { orders: {}, activeOrderId: undefined, developerOutcome: "success" }, version: 0 } },
    users: [],
  };
}

function main() {
  ensureDir(publicDir);
  writeFileSync(seedPath, JSON.stringify(buildBaseline(), null, 2), "utf8");
  setFlag("NEXT_PUBLIC_APPLY_MOCK_SEEDS", "true");
  setFlag("NEXT_PUBLIC_RESET_ON_BOOT", "true");
  console.log("♻️  Baseline seed written and reset flag set.");
}

main();

