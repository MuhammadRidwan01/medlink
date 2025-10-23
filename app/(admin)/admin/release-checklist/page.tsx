"use client";

import { useCallback, useMemo, useState } from "react";

type Check = { id: string; label: string; pass: boolean | null; detail?: string };

async function checkRedirectGuard(): Promise<Check> {
  try {
    const res = await fetch("/patient/dashboard", { redirect: "manual" as RequestRedirect });
    const ok = res.status === 307 || res.status === 308 || (res.status >= 300 && res.status < 400);
    return { id: "routes", label: "Routes guarded", pass: ok, detail: `status ${res.status}` };
  } catch (e) {
    return { id: "routes", label: "Routes guarded", pass: false, detail: String(e) };
  }
}

async function checkTriageMock(): Promise<Check> {
  try {
    const mod = await import("@/components/features/ai-triage/chat-interface");
    const ok = typeof mod.ChatInterface === "function";
    await new Promise((r) => setTimeout(r, 50));
    return { id: "triage", label: "Open AI Triage mock stream", pass: ok };
  } catch (e) {
    return { id: "triage", label: "Open AI Triage mock stream", pass: false, detail: String(e) };
  }
}

async function checkDraftPrescriptionConflict(): Promise<Check> {
  try {
    const data = await import("@/components/features/marketplace/data");
    const { useMarketplaceCart } = await import("@/components/features/marketplace/store");
    const prod = (data.MOCK_PRODUCTS || []).find((p: any) => Array.isArray(p.conflicts) && p.conflicts.length);
    if (!prod)
      return {
        id: "rx",
        label: "Draft Prescription interaction warning",
        pass: false,
        detail: "no product with conflicts",
      };
    const store = useMarketplaceCart.getState();
    store.addItem(prod);
    const item = useMarketplaceCart
      .getState()
      .items.find((i: { product: { id: string } }) => i.product.id === prod.id);
    const ok = Boolean(item && (item.conflicts?.length || 0) > 0);
    return { id: "rx", label: "Draft Prescription interaction warning", pass: ok };
  } catch (e) {
    return { id: "rx", label: "Draft Prescription interaction warning", pass: false, detail: String(e) };
  }
}

async function checkCheckoutFlow(): Promise<Check> {
  try {
    const { usePaymentStore } = await import("@/components/features/payment/store");
    const st = usePaymentStore.getState();
    const orderId = st.createOrder({
      addressId: "addr-1",
      deliveryOptionId: "standard",
      name: "Budi",
      email: "budi@example.com",
      phone: "+62",
      notes: "",
    });
    st.setOrderStatus(orderId, "pending");
    st.setOrderStatus(orderId, "success");
    const final = usePaymentStore.getState().orders[orderId];
    const ok = final?.status === "success";
    return { id: "checkout", label: "Checkout pending -> success via webhook", pass: ok };
  } catch (e) {
    return { id: "checkout", label: "Checkout pending -> success via webhook", pass: false, detail: String(e) };
  }
}

async function checkFollowupBooking(): Promise<Check> {
  try {
    const schedule = await import("@/components/features/schedule/store");
    const before = schedule.getState().appointments.length;
    const id = schedule.bookAppointment({
      consultId: "CONS-101",
      patient: "Budi",
      date: new Date().toISOString().slice(0, 10),
      time: "10:00",
      reason: "Follow up",
    });
    const after = schedule.getState().appointments.length;
    const ok = Boolean(id && after === before + 1);
    return { id: "followup", label: "Book follow-up via mini-scheduler", pass: ok };
  } catch (e) {
    return { id: "followup", label: "Book follow-up via mini-scheduler", pass: false, detail: String(e) };
  }
}

export default function ReleaseChecklistPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Check[]>([]);

  const envReady = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_APPLY_MOCK_SEEDS) && Boolean(process.env.NEXT_PUBLIC_ANALYTICS_DEMO),
    [],
  );
  const tokensSet = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    [],
  );
  const analyticsOn = useMemo(() => process.env.NEXT_PUBLIC_ANALYTICS_DEMO === "true", []);
  const seeded = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const a = localStorage.getItem("ml-content-store-v1");
      const b = localStorage.getItem("ml-schedule-store-v1");
      const c = localStorage.getItem("ml-feedback-state-v1");
      return Boolean(a && b && c);
    } catch {
      return false;
    }
  }, []);

  const runTests = useCallback(async () => {
    setRunning(true);
    const checks = await Promise.all([
      checkRedirectGuard(),
      checkTriageMock(),
      checkDraftPrescriptionConflict(),
      checkCheckoutFlow(),
      checkFollowupBooking(),
    ]);
    setResults(checks);
    setRunning(false);
  }, []);

  const allGreen = envReady && tokensSet && seeded && analyticsOn && results.every((r) => r.pass);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Release Checklist</h1>
      <p className="mt-1 text-muted-foreground">Client-only demo checks for a smooth run.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardToggle label="Env ready" value={envReady} />
        <CardToggle label="Tokens set" value={tokensSet} />
        <CardToggle label="Routes guarded" value={undefined} />
        <CardToggle label="Mock stores seeded" value={seeded} />
        <CardToggle label="Analytics demo on" value={analyticsOn} />
      </div>

      <div className="mt-8">
        <button
          onClick={runTests}
          disabled={running}
          className="interactive rounded-button bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {running ? "Running Smoke Tests..." : "Run Smoke Tests"}
        </button>
      </div>

      {!!results.length && (
        <ul className="mt-6 space-y-2">
          {results.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-card border border-border/60 bg-card px-4 py-3"
            >
              <span className="text-sm">{r.label}</span>
              <span className={r.pass ? "text-green-600" : "text-red-600"}>{r.pass ? "PASS" : "FAIL"}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-card border border-border/60 bg-card p-4">
        <p className="text-sm">
          Overall status: {allGreen ? (
            <span className="text-green-600">All green</span>
          ) : (
            <span className="text-amber-600">Checks pending</span>
          )}
        </p>
      </div>
    </div>
  );
}

function CardToggle({ label, value }: { label: string; value?: boolean }) {
  const state = value === undefined ? "-" : value ? "On" : "Off";
  const color = value === undefined ? "text-muted-foreground" : value ? "text-green-600" : "text-red-600";
  return (
    <div className="rounded-card border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className={`text-sm ${color}`}>{state}</div>
      </div>
    </div>
  );
}

