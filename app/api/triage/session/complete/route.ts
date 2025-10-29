import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { data: session, error: sessionError } = await supabase
    .from("triage_sessions")
    .select("id, status")
    .eq("patient_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    return new Response(JSON.stringify({ error: "Failed to load session" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  if (!session) {
    return new Response(JSON.stringify({ ok: true, session: null }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const { data: updated, error: updateError } = await supabase
    .from("triage_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", session.id)
    .select("id, status, completed_at, updated_at")
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: "Failed to complete session" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ ok: true, session: updated }), { status: 200, headers: { "Content-Type": "application/json" } });
}
