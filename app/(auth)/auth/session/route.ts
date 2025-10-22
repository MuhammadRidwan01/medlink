import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = "sb-access-token";
const REFRESH_TOKEN_COOKIE = "sb-refresh-token";
const SECURE = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  try {
    const { session } = (await request.json()) as {
      session?: {
        access_token: string;
        refresh_token: string;
        expires_at?: number;
      };
    };

    if (!session?.access_token || !session?.refresh_token) {
      return NextResponse.json({ ok: false, message: "Invalid session payload" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });

    const maxAge =
      typeof session.expires_at === "number"
        ? Math.max(session.expires_at - Math.floor(Date.now() / 1000), 0)
        : 60 * 60 * 24 * 7;

    response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("[auth/session] failed to set cookies", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
    response.cookies.delete(REFRESH_TOKEN_COOKIE, { path: "/" });
    return response;
  } catch (error) {
    console.error("[auth/session] failed to clear cookies", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
