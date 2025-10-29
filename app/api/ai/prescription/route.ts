import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AiPrescriptionRequest, RxAiOutput } from "@/lib/clinical/rx-schema";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.AI_RX_MODEL || process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let payload: AiPrescriptionRequest;
  try {
    // Lazy import zod parsing to avoid crashing if zod missing at build, but types expect it installed
    const { AiPrescriptionRequest: Schema } = await import("@/lib/clinical/rx-schema");
    payload = Schema.parse(body);
  } catch (e) {
    console.error("[ai/prescription] Validation error:", e);
    console.error("[ai/prescription] Received body:", JSON.stringify(body, null, 2));
    return NextResponse.json({ error: "Invalid payload", detail: String((e as Error).message) }, { status: 400 });
  }

  const system = `You are MedLink AI, assisting to create detailed medication schedules in Bahasa Indonesia.

CRITICAL RULES:
- Provide safe, evidence-based medication recommendations
- Clearly distinguish between OTC (over-the-counter) and Rx (prescription) medications
- Create DETAILED medication schedule with specific times
- Respect allergies and active medications to avoid interactions
- Consider patient age, weight, and condition severity
- Provide clear instructions for optimal therapeutic effect
- Output only JSON in the specified schema, no extra text

MEDICATION TYPES:
- **OTC (Over-the-Counter)**: Obat bebas yang tidak memerlukan resep (Paracetamol, Ibuprofen, Antasida, dll)
- **Rx (Prescription)**: Obat yang memerlukan resep dokter (Antibiotik, Obat keras, dll)

MEDICATION SCHEDULE FORMAT:
- Specify exact times (e.g., "08:00, 14:00, 20:00" for 3x sehari)
- Include timing relative to meals if important
- Provide duration in days with clear end date
- Add important warnings and precautions
- Mark each medication as "otc" or "prescription"`;

  const contextParts: string[] = [];
  if (payload.provisionalDiagnosis) contextParts.push(`Diagnosis: ${payload.provisionalDiagnosis}`);
  if (payload.triageSummary) contextParts.push(`Triage: ${JSON.stringify(payload.triageSummary)}`);
  if (payload.vitals?.length) contextParts.push(`Vitals: ${payload.vitals.map(v => `${v.label}=${v.value}`).join(", ")}`);
  if (payload.patient?.profile) contextParts.push(`Patient: ${JSON.stringify(payload.patient.profile)}`);
  if (payload.patient?.allergies?.length) contextParts.push(`Allergies: ${payload.patient.allergies.map(a => a.substance).join(", ")}`);
  if (payload.patient?.meds?.length) contextParts.push(`Active meds: ${payload.patient.meds.filter(m=>m.status!=="stopped").map(m => m.name).join(", ")}`);

  const userMsg = `Berdasarkan informasi triage yang LENGKAP, buat draf resep obat (1-4 obat) dengan jadwal minum yang DETAIL dan SPESIFIK.

Konteks:
${contextParts.join("\n")}

PENTING:
- Pisahkan obat OTC (bebas) dan obat resep (Rx)
- Berikan jadwal waktu minum yang spesifik (jam berapa saja)
- Jelaskan cara konsumsi (sebelum/sesudah makan, dengan air, dll)
- Berikan durasi yang tepat berdasarkan kondisi
- Tambahkan catatan penting (efek samping, kontraindikasi, dll)
- Berikan rationale mengapa obat ini dipilih
- Tandai setiap obat dengan "type": "otc" atau "prescription"

Skema keluaran (JSON saja): 
{ 
  "suggestions": [ 
    { 
      "name": string (nama obat),
      "code": string (kode/slug obat),
      "type": "otc" | "prescription" (WAJIB: tipe obat),
      "strength": string (kekuatan obat, e.g., "500mg"),
      "dose": string (dosis per konsumsi, e.g., "1 tablet"),
      "frequency": string (frekuensi DETAIL dengan jam, e.g., "3x sehari (08:00, 14:00, 20:00)"),
      "duration": string (durasi lengkap, e.g., "3 hari atau hingga demam turun"),
      "notes": string (instruksi lengkap: waktu konsumsi, cara minum, hal yang harus dihindari),
      "rationale": string (alasan pemilihan obat berdasarkan gejala)
    } 
  ], 
  "warnings"?: string[] (peringatan penting jika ada),
  "requiresDoctorApproval": boolean (true jika ada obat resep)
}`;

  const groqBody = JSON.stringify({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    max_tokens: 800,
    stream: false,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
  });

  let response: Response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqBody,
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach Groq" }, { status: 502 });
  }

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: "Groq error", detail: err }, { status: response.status });
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "Empty AI response" }, { status: 502 });

  // Try parse JSON possibly wrapped in code fences
  const jsonText = extractJson(content);
  let parsed: RxAiOutput | null = null;
  try {
    const obj = JSON.parse(jsonText);
    // runtime validate
    const { RxAiOutput: OutSchema } = await import("@/lib/clinical/rx-schema");
    parsed = OutSchema.parse(obj);
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse AI output", detail: String((e as Error).message), raw: content }, { status: 422 });
  }

  return NextResponse.json(parsed);
}

function extractJson(text: string): string {
  const fence = /```json[\s\S]*?```/i;
  const m = text.match(fence);
  const raw = m ? m[0].replace(/```json|```/gi, "").trim() : text.trim();
  return raw;
}
