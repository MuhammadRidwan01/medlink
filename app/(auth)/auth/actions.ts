'use server';

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult =
  | {
      ok: true;
      session: {
        access_token: string;
        refresh_token: string;
        expires_at: number | null;
      };
      user: {
        id: string;
        email: string | null;
        full_name: string | null;
      };
    }
  | {
      ok: false;
      message: string;
    };

type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
};

type RegisterResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    return { ok: false, message: 'Email dan kata sandi wajib diisi.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    const message = error?.message ?? 'Email atau kata sandi salah.';
    return { ok: false, message };
  }

  const session = data.session;

  // Upsert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: session.user.id,
        email: session.user.email ?? session.user.user_metadata?.email ?? null,
        name:
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          null,
      },
      { onConflict: 'id' },
    );

  if (profileError) {
    console.error('[auth] failed to upsert profile:', profileError);
  }

  return {
    ok: true,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at ?? null,
    },
    user: {
      id: session.user.id,
      email: session.user.email ?? session.user.user_metadata?.email ?? null,
      full_name:
        session.user.user_metadata?.full_name ??
        session.user.user_metadata?.name ??
        null,
    },
  };
}

export async function registerAction(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password;
  const fullName = payload.fullName.trim();

  if (!email || !password || !fullName) {
    return { ok: false, message: 'Semua kolom wajib diisi.' };
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: 'Kata sandi minimal 8 karakter.',
    };
  }

  const supabase = await createClient();
  const redirectBase =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const normalizedRedirect =
    redirectBase && redirectBase !== ''
      ? redirectBase.replace(/\/$/, '')
      : undefined;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "patient"
      },
      emailRedirectTo: normalizedRedirect
        ? `${normalizedRedirect}/auth/login`
        : undefined,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
