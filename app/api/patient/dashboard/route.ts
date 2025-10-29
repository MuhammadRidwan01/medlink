import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const from = (table: string) => (supabase.from as any)(table);
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get user's prescriptions with approval status
    const { data: prescriptions, error: prescriptionsError } = await from("prescriptions")
      .select(`
        id,
        doctor_id,
        status,
        approval_status,
        created_at,
        approved_at,
        rejection_reason,
        prescription_items (
          id,
          name,
          medication_type,
          strength,
          dose,
          frequency,
          duration
        )
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (prescriptionsError) {
      console.error("Error fetching prescriptions:", prescriptionsError);
    }

    // Get user's appointments
    const { data: appointments, error: appointmentsError } = await from("appointments")
      .select(`
        id,
        doctor_id,
        starts_at,
        ends_at,
        reason,
        status,
        created_at
      `)
      .eq("patient_id", user.id)
      .gte("starts_at", today.toISOString())
      .order("starts_at", { ascending: true })
      .limit(5);

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
    }

    // Get user's triage sessions
    const { data: triageSessions, error: triageError } = await from("triage_sessions")
      .select(`
        id,
        status,
        risk_level,
        summary,
        created_at,
        updated_at
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (triageError) {
      console.error("Error fetching triage sessions:", triageError);
    }

    // Calculate stats
    const prescriptionList = (prescriptions ?? []) as Array<{ approval_status?: string | null; status?: string | null }>;
    const pendingPrescriptions = prescriptionList.filter(
      (p) => p?.approval_status === "pending"
    ).length;

    const approvedPrescriptions = prescriptionList.filter(
      (p) => p?.approval_status === "approved" && p?.status === "active"
    ).length;

    const appointmentList = (appointments ?? []) as Array<{ status?: string | null; starts_at?: string | null }>;
    const upcomingAppointments = appointmentList.filter(
      (a) => a?.status === "scheduled"
    ).length;

    const triageList = (triageSessions ?? []) as Array<{ status?: string | null }>;
    const completedTriage = triageList.filter(
      (t) => t?.status === "completed"
    ).length;

    // Get next appointment
    const nextAppointment = appointmentList.find(
      (appointment) =>
        appointment?.status === "scheduled" &&
        appointment?.starts_at &&
        new Date(appointment.starts_at) > new Date()
    );

    // Get latest triage session
    const latestTriage = triageSessions?.[0] || null;

    return NextResponse.json({
      stats: {
        pendingPrescriptions,
        approvedPrescriptions,
        upcomingAppointments,
        completedTriage,
      },
      prescriptions: prescriptions || [],
      appointments: appointments || [],
      triageSessions: triageSessions || [],
      highlights: {
        nextAppointment,
        latestTriage,
      },
    });

  } catch (error) {
    console.error("Patient dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
