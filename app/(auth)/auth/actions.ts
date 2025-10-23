'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

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

const ACCESS_TOKEN_COOKIE = 'sb-access-token';
const REFRESH_TOKEN_COOKIE = 'sb-refresh-token';
const SECURE_COOKIE = process.env.NODE_ENV === 'production';

const getSupabaseActionClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

const upsertProfileSnapshot = async (params: {
  accessToken: string;
  userId: string;
  email: string | null;
  fullName: string | null;
}) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  });

  const { error } = await client
    .from('profiles')
    .upsert(
      {
        id: params.userId,
        email: params.email,
        name: params.fullName,
      },
      { onConflict: 'id' },
    );

  if (error) {
    console.error('[auth] failed to upsert profile snapshot', error);
  }
};

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  const email = payload.email.trim().toLowerCase();
  const password = payload.password;

  if (!email || !password) {
    return { ok: false, message: 'Email dan kata sandi wajib diisi.' };
  }

  const supabase = getSupabaseActionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    const message = error?.message ?? 'Email atau kata sandi salah.';
    return { ok: false, message };
  }

  const session = data.session;
  const cookieStore = await cookies();

  const expiresAtSeconds = session.expires_at ?? null;
  const maxAge =
    expiresAtSeconds !== null
      ? Math.max(expiresAtSeconds - Math.floor(Date.now() / 1000), 0)
      : 60 * 60 * 24 * 7;

  cookieStore.set({
    name: ACCESS_TOKEN_COOKIE,
    value: session.access_token,
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIE,
    path: '/',
    maxAge,
  });

  cookieStore.set({
    name: REFRESH_TOKEN_COOKIE,
    value: session.refresh_token,
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIE,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  await upsertProfileSnapshot({
    accessToken: session.access_token,
    userId: session.user.id,
    email: session.user.email ?? session.user.user_metadata?.email ?? null,
    fullName:
      session.user.user_metadata?.full_name ??
      session.user.user_metadata?.name ??
      null,
  });

  return {
    ok: true,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: expiresAtSeconds,
    },
    user: {
      id: session.user.id,
      email:
        session.user.email ?? session.user.user_metadata?.email ?? null,
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

  const supabase = getSupabaseActionClient();
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
