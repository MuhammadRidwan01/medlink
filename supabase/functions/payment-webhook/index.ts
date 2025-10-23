import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type WebhookPayload = {
  orderId?: string;
  outcome?: "success" | "failed";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing Supabase credentials", { status: 500, headers: corsHeaders });
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response("Invalid JSON payload", { status: 400, headers: corsHeaders });
  }

  const orderId = payload.orderId?.trim();
  const outcome = payload.outcome;

  if (!orderId || (outcome !== "success" && outcome !== "failed")) {
    return new Response("Invalid payload", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: paymentRow, error: fetchError } = await supabase
    .from("commerce.payments")
    .select("id, order_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("fetch payment error", fetchError);
    return new Response("Failed to fetch payment", { status: 500, headers: corsHeaders });
  }

  if (!paymentRow) {
    return new Response("Payment not found", { status: 404, headers: corsHeaders });
  }

  const { error: paymentUpdateError } = await supabase
    .from("commerce.payments")
    .update({ status: outcome })
    .eq("id", paymentRow.id);

  if (paymentUpdateError) {
    console.error("update payment error", paymentUpdateError);
    return new Response("Failed to update payment", { status: 500, headers: corsHeaders });
  }

  if (outcome === "success") {
    const { error: orderUpdateError } = await supabase
      .from("commerce.orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (orderUpdateError) {
      console.error("update order error", orderUpdateError);
      return new Response("Failed to update order", { status: 500, headers: corsHeaders });
    }
  }

  const channel = supabase.channel("payment:update", {
    config: {
      broadcast: { ack: true },
    },
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

  return new Response(
    JSON.stringify({
      ok: true,
      orderId,
      paymentId: paymentRow.id,
      status: outcome,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});
