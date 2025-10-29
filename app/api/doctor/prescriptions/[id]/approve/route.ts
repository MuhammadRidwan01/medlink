import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const supabase = await getSupabaseServerClient();
    const from = (table: string) => (supabase.from as any)(table);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    const { data: doctorData } = await from("doctors")
      .select("id, is_active")
      .eq("id", user.id)
      .single();

    if (!doctorData || !doctorData.is_active) {
      return NextResponse.json({ error: "Not a doctor or inactive" }, { status: 403 });
    }

    const { id: prescriptionId } = await context.params;

    // Get prescription details
    const { data: prescription, error: fetchError } = await from("prescriptions")
      .select("*")
      .eq("id", prescriptionId)
      .eq("doctor_id", user.id)
      .single();

    if (fetchError || !prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    if (prescription.approval_status !== "pending") {
      return NextResponse.json(
        { error: "Prescription already processed" },
        { status: 400 }
      );
    }

    // Approve prescription
    const { data: updated, error: updateError } = await from("prescriptions")
      .update({
        approval_status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        status: "active",
      })
      .eq("id", prescriptionId)
      .select()
      .single();

    if (updateError) {
      console.error("Error approving prescription:", updateError);
      return NextResponse.json(
        { error: "Failed to approve prescription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prescription: updated,
    });

  } catch (error) {
    console.error("Approve prescription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
