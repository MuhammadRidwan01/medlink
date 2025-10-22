import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/(patient)", "/(doctor)"];
const AUTH_PREFIX = "/(auth)";

const decodeJwtPayload = (token?: string) => {
  if (!token) return null;
  const segments = token.split(".");
  if (segments.length < 2) return null;
  try {
    const base64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const resolveRole = (payload: Record<string, unknown> | null): "doctor" | "patient" => {
  const metaRole =
    (payload?.user_metadata as Record<string, unknown> | undefined)?.role ??
    (payload?.app_metadata as Record<string, unknown> | undefined)?.role;
  if (metaRole === "doctor") {
    return "doctor";
  }

  const email =
    (payload?.email as string | undefined) ??
    ((payload?.user_metadata as Record<string, unknown> | undefined)?.email as
      | string
      | undefined);
  if (email && email.toLowerCase().includes("doctor")) {
    return "doctor";
  }

  return "patient";
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("sb-access-token")?.value);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX);

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/(auth)/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    const payload = decodeJwtPayload(request.cookies.get("sb-access-token")?.value);
    const role = resolveRole(payload);
    const dashboardUrl =
      role === "doctor" ? "/(doctor)/dashboard" : "/(patient)/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(patient)/(.*)", "/(doctor)/(.*)", "/(auth)/(.*)"],
};
