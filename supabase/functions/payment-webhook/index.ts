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

  const { data: rpcResult, error: rpcError } = await supabase.rpc("process_payment_webhook", {
    in_order_id: orderId,
    in_outcome: outcome,
  });

  if (rpcError) {
    console.error("process payment error", rpcError);

    if (rpcError.message === "payment_not_found") {
      return new Response("Payment not found", { status: 404, headers: corsHeaders });
    }

    if (rpcError.message === "invalid_input" || rpcError.message === "invalid_outcome") {
      return new Response("Invalid payload", { status: 400, headers: corsHeaders });
    }

    return new Response("Failed to process payment", { status: 500, headers: corsHeaders });
  }

  if (!rpcResult) {
    console.error("process payment error: empty result");
    return new Response("Failed to process payment", { status: 500, headers: corsHeaders });
  }

  const { payment_id: paymentId, status: persistedStatus } = rpcResult as {
    payment_id?: string;
    order_id?: string;
    status?: string;
  };

  if (!paymentId || !persistedStatus) {
    console.error("process payment error: invalid payload", rpcResult);
    return new Response("Failed to process payment", { status: 500, headers: corsHeaders });
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
        paymentId,
        status: persistedStatus,
        timestamp: new Date().toISOString(),
      },
    });
  await channel.unsubscribe();

  return new Response(
    JSON.stringify({
      ok: true,
      orderId,
      paymentId,
      status: persistedStatus,
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});
