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

  const system = `You are MedLink AI, assisting doctors to propose prescription drafts in Bahasa Indonesia.
Rules:
- Provide safe, common first-line options only with dosage/frequency/duration suitable for adults unless context says otherwise.
- Respect allergies and active medications to avoid interactions.
- Output only JSON in the specified schema, no extra text.`;

  const contextParts: string[] = [];
  if (payload.provisionalDiagnosis) contextParts.push(`Diagnosis: ${payload.provisionalDiagnosis}`);
  if (payload.triageSummary) contextParts.push(`Triage: ${JSON.stringify(payload.triageSummary)}`);
  if (payload.vitals?.length) contextParts.push(`Vitals: ${payload.vitals.map(v => `${v.label}=${v.value}`).join(", ")}`);
  if (payload.patient?.profile) contextParts.push(`Patient: ${JSON.stringify(payload.patient.profile)}`);
  if (payload.patient?.allergies?.length) contextParts.push(`Allergies: ${payload.patient.allergies.map(a => a.substance).join(", ")}`);
  if (payload.patient?.meds?.length) contextParts.push(`Active meds: ${payload.patient.meds.filter(m=>m.status!=="stopped").map(m => m.name).join(", ")}`);

  const userMsg = `Buat draf resep (1-3 item) beserta dosis, frekuensi, durasi, dan catatan singkat jika perlu berdasarkan konteks berikut:\n${contextParts.join("\n")}\n\nSkema keluaran (JSON saja): { "suggestions": [ { "name": string, "code": string, "strength": string, "dose": string, "frequency": string, "duration": string, "notes"?: string, "rationale"?: string } ], "warnings"?: string[] }`;

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
  } catch (err) {
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
