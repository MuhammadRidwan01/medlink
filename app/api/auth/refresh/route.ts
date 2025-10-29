import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Attempt to refresh the session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Auth refresh error:", error);
      return NextResponse.json(
        { error: "Failed to refresh session" },
        { status: 401 }
      );
    }
    
    if (!data.session) {
      return NextResponse.json(
        { error: "No active session to refresh" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Session refreshed successfully" 
    });
    
  } catch (err) {
    console.error("Refresh endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
