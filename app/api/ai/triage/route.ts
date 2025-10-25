import { TRIAGE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  coerceTriageSummary,
  createEmptyTriageSummary,
  parseTriageInsight,
  type TriageSummary,
} from "@/types/triage";

type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type PatientProfileContext = {
  name?: string;
  age?: string;
  sex?: string;
  bloodType?: string;
};

type PatientMedicationContext = {
  name: string;
  strength?: string;
  frequency?: string;
};

type TriageRequestContext = {
  patient?: {
    profile?: PatientProfileContext;
    allergies?: string[];
    medications?: PatientMedicationContext[];
  };
  triageSummary?: {
    riskLevel?: string;
    symptoms?: string[];
    duration?: string;
    redFlags?: string[];
  };
};

type LatestUserMessagePayload = {
  id: string;
  content: string;
  createdAt?: string;
};

type TriageRequestPayload = {
  sessionId?: string | null;
  messages?: ChatCompletionMessage[];
  latestUserMessage?: LatestUserMessagePayload;
  context?: TriageRequestContext | null;
};

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-70b-versatile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return jsonError("GROQ_API_KEY is not configured", 500);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Unauthorized", 401);
  }

  let payload: TriageRequestPayload;
  try {
    payload = (await request.json()) as TriageRequestPayload;
  } catch {
    return jsonError("Invalid JSON payload", 400);
  }

  const incomingMessages = Array.isArray(payload.messages) ? payload.messages : [];
  const sanitizedMessages = incomingMessages
    .filter(
      (message): message is ChatCompletionMessage =>
        Boolean(
          message &&
            typeof message.content === "string" &&
            (message.role === "user" || message.role === "assistant") &&
            message.content.trim(),
        ),
    )
    .slice(-16);

  if (!sanitizedMessages.length) {
    return jsonError("No chat messages supplied", 400);
  }

  if (!payload.latestUserMessage || typeof payload.latestUserMessage.content !== "string") {
    return jsonError("latestUserMessage is required", 400);
  }

  // Determine or create triage session
  const session = await ensureTriageSession(
    supabase,
    user.id,
    payload.sessionId,
    payload.latestUserMessage.createdAt,
  );

  if (!session) {
    return jsonError("Failed to prepare triage session", 500);
  }

  // Persist the latest user message if not already stored
  await persistUserMessage(supabase, session.id, payload.latestUserMessage);

  // Merge session summary into context so server state is the source of truth
  const sessionSummary = coerceTriageSummary(session.summary, createEmptyTriageSummary());
  const contextPrompt = buildContextPrompt({
    ...payload.context,
    triageSummary: {
      riskLevel: sessionSummary.riskLevel,
      symptoms: sessionSummary.symptoms,
      duration: sessionSummary.duration,
      redFlags: sessionSummary.redFlags,
    },
  });

  const contextMessages: ChatCompletionMessage[] = [{ role: "system", content: TRIAGE_SYSTEM_PROMPT }];
  if (contextPrompt) {
    contextMessages.push({ role: "system", content: contextPrompt });
  }

  const body = JSON.stringify({
    model: DEFAULT_MODEL,
    temperature: 0.3,
    max_tokens: 1024,
    stream: true,
    messages: [...contextMessages, ...sanitizedMessages],
  });

  let groqResponse: Response;
  try {
    groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body,
    });
  } catch (error) {
    console.error("Groq request failed:", error);
    return jsonError("Failed to reach Groq API", 502);
  }

  if (!groqResponse.ok || !groqResponse.body) {
    const errorPayload = await groqResponse.text();
    console.error("Groq error response:", errorPayload);
    return jsonError("Groq API returned an error", groqResponse.status, {
      detail: errorPayload,
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let accumulated = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = groqResponse.body!.getReader();
      let isClosed = false;
      let completed = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            completed = true;
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) {
              continue;
            }

            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") {
              if (data === "[DONE]") {
                safeClose();
                return;
              }
              continue;
            }

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                controller.enqueue(encoder.encode(delta));
              }
            } catch (error) {
              console.warn("Failed to parse Groq SSE chunk:", error, data);
            }
          }
        }
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
        if (!isClosed) {
          controller.close();
          isClosed = true;
        }
        if (completed && accumulated.trim()) {
          const parsedSummary = parseTriageInsight(accumulated, sessionSummary);
          await Promise.all([
            supabase
              .from("triage_messages")
              .insert({
                session_id: session.id,
                role: "ai",
                content: accumulated.trim(),
                metadata: {
                  risk_level: parsedSummary.riskLevel,
                  red_flags: parsedSummary.redFlags,
                },
              })
              .then(({ error }) => {
                if (error) {
                  console.error("[triage] failed to insert ai message", error);
                }
              }),
            supabase
              .from("triage_sessions")
              .update({
                risk_level: parsedSummary.riskLevel,
                summary: parsedSummary,
                updated_at: new Date().toISOString(),
              })
              .eq("id", session.id)
              .then(({ error }) => {
                if (error) {
                  console.error("[triage] failed to update session summary", error);
                }
              }),
          ]);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Triage-Session": session.id,
    },
  });
}

function buildContextPrompt(context: TriageRequestContext | null | undefined): string | null {
  if (!context) return null;

  const sections: string[] = [];

  if (context.patient) {
    const patientLines: string[] = [];
    const profile = context.patient.profile;
    if (profile) {
      const profileDetails: string[] = [];
      if (profile.name) {
        profileDetails.push(`Nama: ${profile.name}`);
      }
      if (profile.age) {
        profileDetails.push(`Usia: ${profile.age}`);
      }
      if (profile.sex) {
        profileDetails.push(`Jenis kelamin: ${profile.sex}`);
      }
      if (profile.bloodType) {
        profileDetails.push(`Golongan darah: ${profile.bloodType}`);
      }
      if (profileDetails.length) {
        patientLines.push(profileDetails.join(" | "));
      }
    }

    const allergies = Array.isArray(context.patient.allergies)
      ? context.patient.allergies.filter((item) => typeof item === "string" && item.trim())
      : [];
    if (allergies.length) {
      patientLines.push(`Alergi tercatat: ${allergies.join(", ")}`);
    }

    const medications = Array.isArray(context.patient.medications)
      ? context.patient.medications
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const name = item.name?.trim();
            if (!name) return null;
            const parts = [name];
            if (item.strength?.trim()) parts.push(item.strength.trim());
            if (item.frequency?.trim()) parts.push(item.frequency.trim());
            return parts.join(" - ");
          })
          .filter((entry): entry is string => Boolean(entry))
      : [];
    if (medications.length) {
      patientLines.push(`Obat rutin: ${medications.join(", ")}`);
    }

    if (patientLines.length) {
      sections.push(`Informasi Pasien:\n- ${patientLines.join("\n- ")}`);
    }
  }

  if (context.triageSummary) {
    const summaryLines: string[] = [];
    if (Array.isArray(context.triageSummary.symptoms) && context.triageSummary.symptoms.length) {
      summaryLines.push(`Gejala terakhir: ${context.triageSummary.symptoms.join(", ")}`);
    }
    if (context.triageSummary.duration) {
      summaryLines.push(`Durasi gejala: ${context.triageSummary.duration}`);
    }
    if (context.triageSummary.riskLevel) {
      summaryLines.push(`Risk level terakhir: ${context.triageSummary.riskLevel}`);
    }
    if (Array.isArray(context.triageSummary.redFlags) && context.triageSummary.redFlags.length) {
      summaryLines.push(`Red flag terdeteksi: ${context.triageSummary.redFlags.join(", ")}`);
    }

    if (summaryLines.length) {
      sections.push(`Ringkasan Triage Sebelumnya:\n- ${summaryLines.join("\n- ")}`);
    }
  }

  if (!sections.length) return null;

  return `${sections.join(
    "\n\n",
  )}\n\nGunakan data ini sebagai konteks pasien sebelum melanjutkan percakapan.`;
}

async function ensureTriageSession(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  patientId: string,
  requestedSessionId?: string | null,
  clientTimestamp?: string,
) {
  const emptySummary = createEmptyTriageSummary();

  if (requestedSessionId) {
    const { data, error } = await supabase
      .from("triage_sessions")
      .select("*")
      .eq("id", requestedSessionId)
      .maybeSingle();

    if (error) {
      console.error("[triage] failed to load session by id", error);
      return null;
    }

    if (data && data.patient_id === patientId) {
      if (data.status === "completed") {
        return createSession(supabase, patientId, clientTimestamp ?? new Date().toISOString(), emptySummary);
      }
      return data;
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("triage_sessions")
    .select("*")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error("[triage] failed to fetch active session", existingError);
    return null;
  }

  if (existing) {
    return existing;
  }

  return createSession(supabase, patientId, clientTimestamp ?? new Date().toISOString(), emptySummary);
}

async function createSession(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  patientId: string,
  timestamp: string,
  summary: TriageSummary,
) {
  const { data, error } = await supabase
    .from("triage_sessions")
    .insert({
      patient_id: patientId,
      status: "active",
      summary,
      created_at: timestamp,
      updated_at: timestamp,
      risk_level: summary.riskLevel,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[triage] failed to create session", error);
    return null;
  }

  return data;
}

async function persistUserMessage(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  sessionId: string,
  latestMessage: LatestUserMessagePayload,
) {
  if (!latestMessage.id) {
    return;
  }

  const { data: existing } = await supabase
    .from("triage_messages")
    .select("id")
    .eq("session_id", sessionId)
    .eq("metadata->>client_id", latestMessage.id)
    .maybeSingle();

  if (existing) {
    return;
  }

  const { error } = await supabase.from("triage_messages").insert({
    session_id: sessionId,
    role: "user",
    content: latestMessage.content,
    created_at: latestMessage.createdAt ?? new Date().toISOString(),
    metadata: {
      client_id: latestMessage.id,
    },
  });

  if (error) {
    console.error("[triage] failed to persist user message", error);
  }
}

function jsonError(message: string, status: number, extras?: Record<string, unknown>) {
  return new Response(
    JSON.stringify({
      error: message,
      ...extras,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}
