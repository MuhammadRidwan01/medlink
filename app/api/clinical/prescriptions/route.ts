import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PrescriptionItemInput, PrescriptionStatus } from "@/lib/clinical/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Create a prescription with items; if submit=true, set status to awaiting_approval
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any; try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const patientId: string | undefined = body?.patientId;
  const items: PrescriptionItemInput[] = Array.isArray(body?.items) ? body.items : [];
  const submit: boolean = Boolean(body?.submit);

  if (!patientId || !/^[0-9a-fA-F-]{36}$/.test(patientId)) {
    return NextResponse.json({ error: "patientId is required (uuid)" }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }

  // Check doctor role
  const { data: doctorRow } = await supabase.schema("clinical").from("doctors").select("id, is_active").eq("id", user.id).maybeSingle();
  if (!doctorRow?.id || doctorRow.is_active === false) {
    return NextResponse.json({ error: "Only active doctors can create prescriptions" }, { status: 403 });
  }

  // Create prescription
  const { data: created, error: errCreate } = await supabase
    .schema("clinical")
    .from("prescriptions")
    .insert({ user_id: patientId, doctor_id: user.id, status: "draft" satisfies PrescriptionStatus })
    .select("id, user_id, doctor_id, status, created_at")
    .single();

  if (errCreate || !created) return NextResponse.json({ error: errCreate?.message || "create failed" }, { status: 500 });

  // Insert items
  for (const it of items) {
    const payload = { prescription_id: created.id, name: it.name ?? null, strength: it.strength ?? null, frequency: it.frequency ?? null, duration: it.duration ?? null, notes: it.notes ?? null };
    const { error: errItem } = await supabase.schema("clinical").from("prescription_items").insert(payload).select("id").single();
    if (errItem) return NextResponse.json({ error: errItem.message }, { status: 500 });
  }

  // Update status if submit
  if (submit) {
    const { error: errSubmit, data: updated } = await supabase
      .schema("clinical")
      .from("prescriptions")
      .update({ status: "awaiting_approval" satisfies PrescriptionStatus })
      .eq("id", created.id)
      .select("id, status")
      .single();
    if (errSubmit) return NextResponse.json({ error: errSubmit.message }, { status: 500 });
    return NextResponse.json({ id: updated?.id ?? created.id, status: updated?.status ?? "awaiting_approval" });
  }

  return NextResponse.json({ id: created.id, status: created.status });
}
