export type RiskLevel = "low" | "moderate" | "high" | "emergency";

export type TriageRecommendation = {
  type?: string;
  reason?: string;
  otcSuggestions?: string[];
  urgency?: string;
};

export type TriageSummary = {
  riskLevel: RiskLevel;
  symptoms: string[];
  duration: string;
  redFlags: string[];
  severity?: string;
  recommendation?: TriageRecommendation | null;
  updatedAt: string;
};

export function createEmptyTriageSummary(): TriageSummary {
  return {
    riskLevel: "low",
    symptoms: ["Belum ada data"],
    duration: "Belum diketahui",
    redFlags: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeRiskLevel(value: string | null | undefined, fallback: RiskLevel): RiskLevel {
  switch (value?.toLowerCase()) {
    case "low":
      return "low";
    case "moderate":
      return "moderate";
    case "high":
      return "high";
    case "emergency":
      return "emergency";
    default:
      return fallback;
  }
}

export function extractTriageInsightPayload(message: string): string | null {
  const codeBlockMatch = message.match(/```json([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const jsonMatches = message.match(/\{[\s\S]*\}/g);
  if (jsonMatches && jsonMatches.length > 0) {
    return jsonMatches[jsonMatches.length - 1].trim();
  }
  return null;
}

export function parseTriageInsight(message: string, fallback: TriageSummary): TriageSummary {
  const raw = extractTriageInsightPayload(message);
  if (!raw) {
    return { ...fallback, updatedAt: new Date().toISOString() };
  }

  try {
    const parsed = JSON.parse(raw) as {
      riskLevel?: string;
      severity?: string;
      symptoms?: unknown;
      duration?: unknown;
      redFlags?: unknown;
      recommendation?: unknown;
    };

    const riskLevel = normalizeRiskLevel(parsed.riskLevel, fallback.riskLevel);
    const symptoms = Array.isArray(parsed.symptoms)
      ? parsed.symptoms.map((item) => String(item).trim()).filter(Boolean)
      : fallback.symptoms;
    const duration =
      typeof parsed.duration === "string" && parsed.duration.trim()
        ? parsed.duration.trim()
        : fallback.duration;
    const redFlags = Array.isArray(parsed.redFlags)
      ? parsed.redFlags.map((item) => String(item).trim()).filter(Boolean)
      : [];

    const summary: TriageSummary = {
      riskLevel,
      severity:
        typeof parsed.severity === "string" && parsed.severity.trim()
          ? parsed.severity.trim()
          : fallback.severity,
      symptoms: symptoms.length ? symptoms : fallback.symptoms,
      duration,
      redFlags,
      recommendation: isRecommendation(parsed.recommendation) ? parsed.recommendation : fallback.recommendation,
      updatedAt: new Date().toISOString(),
    };

    return summary;
  } catch (error) {
    console.warn("Failed to parse triage insight JSON:", error);
    return { ...fallback, updatedAt: new Date().toISOString() };
  }
}

export function coerceTriageSummary(value: unknown, fallback: TriageSummary): TriageSummary {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const summary = value as Partial<TriageSummary>;
  return {
    riskLevel: normalizeRiskLevel(summary.riskLevel, fallback.riskLevel),
    symptoms: Array.isArray(summary.symptoms) && summary.symptoms.length ? summary.symptoms : fallback.symptoms,
    duration: typeof summary.duration === "string" && summary.duration.trim() ? summary.duration : fallback.duration,
    redFlags: Array.isArray(summary.redFlags) ? summary.redFlags : [],
    severity: typeof summary.severity === "string" ? summary.severity : fallback.severity,
    recommendation: isRecommendation(summary.recommendation) ? summary.recommendation : fallback.recommendation,
    updatedAt:
      typeof summary.updatedAt === "string" && summary.updatedAt.trim()
        ? summary.updatedAt
        : fallback.updatedAt,
  };
}

export function formatTriageTimestamp(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isRecommendation(value: unknown): value is TriageRecommendation {
  if (!value || typeof value !== "object") {
    return false;
  }
  return true;
}
