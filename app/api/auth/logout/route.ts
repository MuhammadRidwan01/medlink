import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      // Continue with response even if logout fails
      // The client will redirect anyway
    }
    
    // Create response with cleared cookies
    const response = NextResponse.json({ 
      success: true,
      message: "Logged out successfully" 
    });
    
    // Clear auth cookies
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    response.cookies.delete("role");
    
    return response;
    
  } catch (err) {
    console.error("Logout endpoint error:", err);
    
    // Still return success and clear cookies
    const response = NextResponse.json({ 
      success: true,
      message: "Logged out successfully" 
    });
    
    response.cookies.delete("sb-access-token");
    response.cookies.delete("sb-refresh-token");
    response.cookies.delete("role");
    
    return response;
  }
}
