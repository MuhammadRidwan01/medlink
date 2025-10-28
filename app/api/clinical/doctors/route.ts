import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .rpc("get_doctors");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ doctors: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any; try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const specialty = typeof body?.specialty === 'string' ? body.specialty : null;
  const license_no = typeof body?.license_no === 'string' ? body.license_no : null;

  const { data, error } = await supabase
    .rpc("upsert_doctor", { specialty, license_no });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Try to persist role in user metadata for future sessions (best-effort)
  try {
    await supabase.auth.updateUser({
      data: { role: "doctor" },
    });
  } catch {
    // ignore
  }

  // Set a lightweight cookie so middleware can redirect immediately without waiting JWT refresh
  const res = NextResponse.json({ doctor: data });
  res.cookies.set("role", "doctor", { path: "/", httpOnly: false, sameSite: "lax" });
  return res;
}
