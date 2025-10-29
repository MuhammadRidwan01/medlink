import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.AI_INTERACTIONS_MODEL || process.env.GROQ_MODEL || "llama-3.1-70b-versatile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const drugs: Array<{ name: string; code?: string; strength?: string }> = Array.isArray(body?.drugs) ? body.drugs : [];
  const allergies: string[] = Array.isArray(body?.allergies) ? body.allergies : [];
  const activeMeds: string[] = Array.isArray(body?.activeMeds) ? body.activeMeds : [];

  if (drugs.length === 0) return NextResponse.json({ error: "drugs is required" }, { status: 400 });

  const system = `You are MedLink AI. Check drug-drug and drug-allergy interactions for Indonesia clinical context.
Output must be JSON only with shape: { "warnings": [ { "id": string, "severity": "low"|"moderate"|"high", "title": string, "message": string, "recommendation": string } ] }`;

  const userMsg = `Evaluate interactions for the following.
Draft drugs: ${JSON.stringify(drugs)}
Allergies: ${JSON.stringify(allergies)}
Active medications: ${JSON.stringify(activeMeds)}

Return concise warnings only if likely relevant.`;

  const resp = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: DEFAULT_MODEL, temperature: 0.1, max_tokens: 600, stream: false, messages: [ { role: "system", content: system }, { role: "user", content: userMsg } ] })
  });

  if (!resp.ok) {
    const t = await resp.text();
    return NextResponse.json({ error: "Groq error", detail: t }, { status: resp.status });
  }
  const data = await resp.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "Empty AI response" }, { status: 502 });

  const jsonText = extractJson(content);
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed?.warnings)) return NextResponse.json({ warnings: [] });
    return NextResponse.json({ warnings: parsed.warnings });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI output", raw: content }, { status: 422 });
  }
}

function extractJson(text: string): string {
  const m = text.match(/```json[\s\S]*?```/i);
  return m ? m[0].replace(/```json|```/gi, "").trim() : text.trim();
}
