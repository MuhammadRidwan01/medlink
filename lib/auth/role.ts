import type { User } from "@supabase/supabase-js";

export type UserRole = "patient" | "doctor";

type MetadataCarrier = Pick<User, "app_metadata" | "user_metadata"> | null | undefined;

function extractRoleFromMetadata(metadata: Record<string, unknown> | undefined): UserRole | null {
  const role = typeof metadata?.["role"] === "string" ? (metadata["role"] as string) : null;
  if (role === "doctor") {
    return "doctor";
  }
  if (role === "patient") {
    return "patient";
  }
  return null;
}

export function deriveRoleFromMetadata(entity: MetadataCarrier): UserRole {
  if (!entity) {
    return "patient";
  }

  const roleFromUser = extractRoleFromMetadata(entity.user_metadata as Record<string, unknown> | undefined);
  if (roleFromUser) {
    return roleFromUser;
  }

  const roleFromApp = extractRoleFromMetadata(entity.app_metadata as Record<string, unknown> | undefined);
  if (roleFromApp) {
    return roleFromApp;
  }

  return "patient";
}

export function getDashboardPath(role?: UserRole): "/patient/dashboard" | "/doctor/dashboard" {
  return role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
}
