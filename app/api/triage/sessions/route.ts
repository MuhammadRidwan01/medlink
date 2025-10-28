import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sessions, error: sessionError } = await supabase
    .from("triage_sessions")
    .select("id, status, summary, risk_level, created_at, updated_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (sessionError) {
    console.error("[sessions] Failed to load sessions:", sessionError);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }

  // Get message count for each session
  const enrichedSessions = await Promise.all(
    (sessions || []).map(async (session) => {
      const { count } = await supabase
        .from("triage_messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", session.id);

      return {
        ...session,
        messageCount: count || 0,
      };
    })
  );

  return NextResponse.json({ sessions: enrichedSessions }, { status: 200 });
}
