import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createEmptyTriageSummary } from "@/types/triage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const now = new Date().toISOString();

  const { data: active } = await supabase
    .from("triage_sessions")
    .select("id")
    .eq("patient_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (active) {
    const { error: completeErr } = await supabase
      .from("triage_sessions")
      .update({ status: "completed", completed_at: now, updated_at: now })
      .eq("id", active.id);
    if (completeErr) {
      console.error("[triage/session/reset] failed to complete active session:", completeErr);
      return new Response(
        JSON.stringify({ error: "Failed to complete active session", detail: completeErr.message ?? String(completeErr) }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const summary = createEmptyTriageSummary();
  const { data: created, error: createError } = await supabase
    .from("triage_sessions")
    .insert({ patient_id: user.id, status: "active", summary, risk_level: summary.riskLevel, created_at: now, updated_at: now })
    .select("id, status, summary, risk_level, created_at, updated_at")
    .single();

  if (createError) {
    console.error("[triage/session/reset] failed to create new session:", createError);
    return new Response(
      JSON.stringify({ error: "Failed to create new session", detail: createError.message ?? String(createError) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ ok: true, session: created }), { status: 200, headers: { "Content-Type": "application/json" } });
}
