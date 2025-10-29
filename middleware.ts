import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/patient", "/doctor"];
const AUTH_PREFIX = "/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = pathname.startsWith(AUTH_PREFIX);

  // IMPORTANT: Do not touch non-GET requests (e.g., Server Actions POST)
  // Modifying these requests can break Next.js Server Actions and cause
  // "Invalid Server Actions request" errors.
  if (request.method !== "GET") {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Redirect to login if accessing protected route without session
  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth route with session
  if (session && isAuthRoute) {
    const role = (session.user.user_metadata?.role ?? session.user.app_metadata?.role) as string | undefined;
    const dashboardUrl = role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/patient/(.*)", "/doctor/(.*)", "/auth/(.*)"],
};
