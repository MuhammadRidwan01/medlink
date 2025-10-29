import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookPayload = {
  orderId?: string;
  outcome?: "success" | "failed";
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return new NextResponse(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers,
  });
}

export async function OPTIONS() {
  return new NextResponse("ok", { headers: corsHeaders });
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse(
      { error: "Supabase credentials are not configured." },
      { status: 500 },
    );
  }

  let payload: WebhookPayload;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const orderId = payload.orderId?.trim();
  const outcome = payload.outcome;

  if (!orderId || (outcome !== "success" && outcome !== "failed")) {
    return jsonResponse({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const from = (table: string) => (supabase.from as any)(table);

  const { data: paymentRow, error: paymentFetchError } = await from("commerce.payments")
    .select("id, order_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentFetchError) {
    console.error("[payment-webhook] fetch payment error", paymentFetchError);
    return jsonResponse({ error: "Failed to fetch payment." }, { status: 500 });
  }

  if (!paymentRow) {
    return jsonResponse({ error: "Payment not found." }, { status: 404 });
  }

  const { error: updatePaymentError } = await from("commerce.payments")
    .update({ status: outcome })
    .eq("id", paymentRow.id);

  if (updatePaymentError) {
    console.error("[payment-webhook] update payment error", updatePaymentError);
    return jsonResponse({ error: "Failed to update payment." }, { status: 500 });
  }

  if (outcome === "success") {
    const { error: updateOrderError } = await from("commerce.orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (updateOrderError) {
      console.error("[payment-webhook] update order error", updateOrderError);
      return jsonResponse({ error: "Failed to update order." }, { status: 500 });
    }
  }

  try {
    const channel = supabase.channel("payment:update", {
      config: { broadcast: { ack: true } },
    });
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "status",
      payload: {
        orderId,
        paymentId: paymentRow.id,
        status: outcome,
        timestamp: new Date().toISOString(),
      },
    });
    await channel.unsubscribe();
  } catch (error) {
    console.error("[payment-webhook] realtime broadcast error", error);
    // Do not fail the webhook if broadcast fails; continue.
  }

  return jsonResponse({
    ok: true,
    orderId,
    paymentId: paymentRow.id,
    status: outcome,
  });
}
