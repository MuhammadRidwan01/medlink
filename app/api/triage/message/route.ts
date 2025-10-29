import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/triage/message
 * Save a triage message (e.g., OTC bubble, appointment bubble) to database
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, role, content, metadata } = body as {
    sessionId?: string;
    role?: string;
    content?: string;
    metadata?: Record<string, any>;
  };

  if (!sessionId || !role) {
    return NextResponse.json(
      { error: "Missing required fields: sessionId, role" },
      { status: 400 }
    );
  }

  // Verify session belongs to user
  const { data: session } = await (supabase as any)
    .from("triage_sessions")
    .select("id, patient_id")
    .eq("id", sessionId)
    .eq("patient_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json(
      { error: "Session not found or unauthorized" },
      { status: 404 }
    );
  }

  // Insert message
  const { data: message, error } = await (supabase as any)
    .from("triage_messages")
    .insert({
      session_id: sessionId,
      role,
      content: content || "",
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("[triage/message] Failed to insert message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message });
}
