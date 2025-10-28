import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// List prescriptions for current user (patient view)
export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: prescriptions, error: rxError } = await supabase
    .schema("clinical")
    .from("prescriptions")
    .select("id, doctor_id, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (rxError) return NextResponse.json({ error: rxError.message }, { status: 500 });

  const enriched = await Promise.all(
    (prescriptions || []).map(async (rx) => {
      const { data: items } = await supabase
        .schema("clinical")
        .from("prescription_items")
        .select("id, name, strength, frequency, duration, notes")
        .eq("prescription_id", rx.id);
      return { ...rx, items: items || [] };
    })
  );

  return NextResponse.json({ prescriptions: enriched });
}
