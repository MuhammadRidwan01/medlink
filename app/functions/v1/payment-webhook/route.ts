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

  const { data: rpcResult, error: rpcError } = await supabase.rpc("process_payment_webhook", {
    in_order_id: orderId,
    in_outcome: outcome,
  });

  if (rpcError) {
    console.error("[payment-webhook] process error", rpcError);

    if (rpcError.message === "payment_not_found") {
      return jsonResponse({ error: "Payment not found." }, { status: 404 });
    }

    if (rpcError.message === "invalid_input" || rpcError.message === "invalid_outcome") {
      return jsonResponse({ error: "Invalid payload." }, { status: 400 });
    }

    return jsonResponse({ error: "Failed to process payment." }, { status: 500 });
  }

  if (!rpcResult) {
    console.error("[payment-webhook] process payment error: empty result");
    return jsonResponse({ error: "Failed to process payment." }, { status: 500 });
  }

  const { payment_id: paymentId, status: persistedStatus } = rpcResult as {
    payment_id?: string;
    order_id?: string;
    status?: string;
  };

  if (!paymentId || !persistedStatus) {
    console.error("[payment-webhook] invalid RPC payload", rpcResult);
    return jsonResponse({ error: "Failed to process payment." }, { status: 500 });
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
        paymentId,
        status: persistedStatus,
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
    paymentId,
    status: persistedStatus,
  });
}
