import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getSupabaseServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(
        name: string,
        value: string,
        options: { path?: string; domain?: string; maxAge?: number; expires?: Date; sameSite?: "lax" | "strict" | "none"; secure?: boolean } = {},
      ) {
        cookieStore.set({ name, value, ...options });
      },
      remove(
        name: string,
        options: { path?: string; domain?: string; maxAge?: number; expires?: Date; sameSite?: "lax" | "strict" | "none"; secure?: boolean } = {},
      ) {
        cookieStore.delete({ name, ...options });
      },
    },
  }) as SupabaseClient;
};
