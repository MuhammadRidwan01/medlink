import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a doctor
    const { data: doctorData } = await supabase
      .from("doctors")
      .select("id, specialty, is_active")
      .eq("id", user.id)
      .single();

    if (!doctorData || !doctorData.is_active) {
      return NextResponse.json({ error: "Not a doctor or inactive" }, { status: 403 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get triage sessions assigned to this doctor (high/emergency risk)
    const { data: triageSessions, error: triageError } = await supabase
      .schema("clinical")
      .from("triage_sessions")
      .select(`
        id,
        patient_id,
        status,
        risk_level,
        summary,
        created_at,
        profiles:patient_id (
          name,
          dob
        )
      `)
      .in("risk_level", ["high", "emergency"])
      .eq("status", "completed")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    if (triageError) {
      console.error("Error fetching triage sessions:", triageError);
    }

    // Get pending prescriptions for approval
    const { data: pendingPrescriptions, error: prescriptionsError } = await supabase
      .from("prescriptions")
      .select(`
        id,
        patient_id,
        status,
        approval_status,
        created_at,
        profiles:patient_id (
          name,
          dob
        ),
        prescription_items (
          id,
          name,
          medication_type,
          requires_approval
        )
      `)
      .eq("doctor_id", user.id)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10);

    if (prescriptionsError) {
      console.error("Error fetching prescriptions:", prescriptionsError);
    }

    // Get today's appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        patient_id,
        starts_at,
        ends_at,
        reason,
        status,
        profiles:patient_id (
          name,
          dob
        )
      `)
      .eq("doctor_id", user.id)
      .gte("starts_at", today.toISOString())
      .lt("starts_at", tomorrow.toISOString())
      .order("starts_at", { ascending: true });

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
    }

    // Calculate KPIs
    const activeAppointments = (appointments || []).filter(a => a.status === "scheduled").length;
    const completedAppointments = (appointments || []).filter(a => a.status === "completed").length;
    const pendingApprovals = (pendingPrescriptions || []).length;
    const urgentCases = (triageSessions || []).filter(t => t.risk_level === "emergency").length;

    // Get recent consultation notes (from completed appointments)
    const { data: recentNotes, error: notesError } = await supabase
      .from("appointments")
      .select(`
        id,
        patient_id,
        reason,
        starts_at,
        profiles:patient_id (
          name
        )
      `)
      .eq("doctor_id", user.id)
      .eq("status", "completed")
      .gte("starts_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("starts_at", { ascending: false })
      .limit(5);

    if (notesError) {
      console.error("Error fetching recent notes:", notesError);
    }

    return NextResponse.json({
      kpis: {
        activeAppointments,
        completedToday: completedAppointments,
        pendingApprovals,
        urgentCases,
      },
      triageQueue: triageSessions || [],
      pendingPrescriptions: pendingPrescriptions || [],
      appointments: appointments || [],
      recentNotes: recentNotes || [],
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
