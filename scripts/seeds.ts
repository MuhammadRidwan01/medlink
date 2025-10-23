#!/usr/bin/env tsx
/*
  Seed script: writes mock seeds for client-only stores and demo flags.
  - Outputs public/mock-seed.json consumed by a client bootstrapper
  - Ensures .env.local has NEXT_PUBLIC_* flags for demo
*/

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

type LocalSeed = Record<string, unknown>;

const root = process.cwd();
const publicDir = join(root, "public");
const seedPath = join(publicDir, "mock-seed.json");
const envLocalPath = join(root, ".env.local");

function ensureDir(p: string) {
  try { mkdirSync(p, { recursive: true }); } catch {}
}

function upsertEnvLocal(next: Record<string, string>) {
  let current = "";
  if (existsSync(envLocalPath)) {
    current = readFileSync(envLocalPath, "utf8");
  }
  const map = new Map<string, string>();
  // parse existing
  current.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  });
  // set provided
  for (const [k, v] of Object.entries(next)) {
    map.set(k, v);
  }
  const out = Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  writeFileSync(envLocalPath, out, "utf8");
}

function buildSeeds(): LocalSeed {
  const now = new Date().toISOString();

  const contentStore = {
    articles: [
      {
        id: "seed-a1",
        slug: "hipertensi-harian",
        title: "Manajemen Hipertensi Harian",
        excerpt: "Pola hidup dan obat yang tepat.",
        content: "# Hipertensi\n\n- Kurangi garam\n- Olahraga rutin",
        author: "Dr. Meida",
        authorRole: "Internist",
        category: "Kardiologi",
        tags: ["hipertensi", "diet"],
        status: "published",
        coverUrl:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        readMinutes: 5,
        createdAt: now,
        publishedAt: now,
      },
      {
        id: "seed-a2",
        slug: "asma-dan-penanganan",
        title: "Asma: Tanda dan Penanganan",
        excerpt: "Kenali pemicu dan teknik inhaler.",
        content: "# Asma\n\nPemicu umum dan perawatan.",
        author: "Dr. Rina",
        authorRole: "Pulmonolog",
        category: "Pulmonologi",
        tags: ["asma", "inhaler"],
        status: "scheduled",
        coverUrl:
          "https://images.unsplash.com/photo-1585436148261-8d9d0d9457c8?auto=format&fit=crop&w=1200&q=80",
        readMinutes: 4,
        createdAt: now,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ],
  };

  const scheduleStore = (() => {
    const slots: Array<{ id: string; date: string; time: string; status: string }> = [];
    const today = new Date();
    for (let d = 0; d < 5; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const ds = date.toISOString().slice(0, 10);
      ["09:00", "10:00", "11:00"].forEach((t) =>
        slots.push({ id: `${ds}-${t}`, date: ds, time: t, status: "open" }),
      );
    }
    const appointments = [
      {
        id: "apt-seed-1",
        consultId: "CONS-1001",
        patient: "Budi",
        reason: "Kontrol DM",
        date: new Date(today.getTime() + 86400000).toISOString().slice(0, 10),
        time: "09:00",
        status: "scheduled",
      },
    ];
    return { slots, appointments };
  })();

  const feedbackStore = {
    entries: [
      {
        id: "fb-seed-1",
        kind: "consultation",
        rating: 4.5,
        tags: ["ramah", "jelas"],
        comment: "Dokter sangat informatif.",
        createdAt: now,
        contactOk: true,
        testimonialOk: false,
      },
    ],
  };

  // Payment: pre-create a pending order to demo webhook simulator
  const paymentStore = {
    state: {
      orders: {
        "INV-SEED-1": {
          id: "INV-SEED-1",
          items: [
            { id: "ci-1", name: "Azithromycin 500 mg", detail: "10 tablet", imageUrl: "", quantity: 1, price: 95000 },
          ],
          addressId: "addr-1",
          deliveryOptionId: "standard",
          contact: { name: "Budi", email: "budi@example.com", phone: "+62 812-0000-0000" },
          notes: "",
          subtotal: 95000,
          shipping: 8000,
          discount: 12000,
          total: 91000,
          status: "pending",
          paymentChannel: "virtual_account",
          createdAt: now,
          lastStatusUpdate: now,
          hasRetried: false,
        },
      },
      activeOrderId: "INV-SEED-1",
      developerOutcome: "success",
    },
    version: 0,
  };

  return {
    localStorage: {
      "ml-content-store-v1": contentStore,
      "ml-schedule-store-v1": scheduleStore,
      "ml-feedback-state-v1": feedbackStore,
    },
    sessionStorage: {
      "payment-store": paymentStore,
    },
    users: [
      { role: "admin", email: "admin@demo.local", password: "admin123" },
      { role: "doctor", email: "doctor@demo.local", password: "doctor123" },
      { role: "patient", email: "patient@demo.local", password: "patient123" },
    ],
  } satisfies LocalSeed;
}

function main() {
  ensureDir(publicDir);
  const seeds = buildSeeds();
  writeFileSync(seedPath, JSON.stringify(seeds, null, 2), "utf8");

  upsertEnvLocal({
    NEXT_PUBLIC_ANALYTICS_DEMO: "true",
    NEXT_PUBLIC_APPLY_MOCK_SEEDS: "true",
    NEXT_PUBLIC_RESET_ON_BOOT: "false",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.local",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-anon-key",
    THEME: process.env.THEME || "light",
  });

  // Version flag to help client decide whether to (re)apply
  writeFileSync(
    join(publicDir, "mock-seed.version"),
    String(Date.now()),
    "utf8",
  );

  console.log("✅ Mock seeds written to", seedPath);
}

main();

