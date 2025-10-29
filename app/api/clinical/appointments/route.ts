import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any; try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const patientId: string | undefined = body?.patientId;
  const doctorId = user.id; // doctor creating the appointment
  const starts_at: string | undefined = body?.starts_at;
  const ends_at: string | undefined = body?.ends_at;
  const reason: string | undefined = body?.reason;

  if (!patientId || !/^[0-9a-fA-F-]{36}$/.test(patientId)) return NextResponse.json({ error: "patientId (uuid) required" }, { status: 400 });
  if (!starts_at || !ends_at) return NextResponse.json({ error: "starts_at and ends_at required (ISO)" }, { status: 400 });

  // Check doctor role
  const { data: doctorRow } = await supabase.from("doctors").select("id, is_active").eq("id", doctorId).maybeSingle();
  if (!doctorRow?.id || doctorRow.is_active === false) return NextResponse.json({ error: "Only active doctors can create appointments" }, { status: 403 });

  const { data, error } = await supabase
    .from("appointments")
    .insert({ patient_id: patientId, doctor_id: doctorId, starts_at, ends_at, reason, status: "scheduled" })
    .select("id, patient_id, doctor_id, starts_at, ends_at, reason, status")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointment: data });
}
