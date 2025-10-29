import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { data: session, error: sessionError } = await (supabase as any)
    .from("triage_sessions")
    .select("id, status, summary, risk_level, created_at, updated_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sessionError) {
    console.error("[triage/session] failed to load session:", sessionError);
    return new Response(
      JSON.stringify({ error: "Failed to load session", detail: sessionError.message ?? String(sessionError) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!session) {
    return new Response(JSON.stringify({ session: null, messages: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const { data: messages, error: msgError } = await (supabase as any)
    .from("triage_messages")
    .select("id, role, content, created_at, metadata")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("[triage/session] failed to load messages:", msgError);
    return new Response(
      JSON.stringify({ error: "Failed to load messages", detail: msgError.message ?? String(msgError) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ session, messages }), { status: 200, headers: { "Content-Type": "application/json" } });
}
