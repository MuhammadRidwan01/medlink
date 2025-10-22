"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionState = {
  status: SessionStatus;
  session: Session | null;
  user: User | null;
  role: "patient" | "doctor";
};

export const inferRoleFromEmail = (email: string | null | undefined): "patient" | "doctor" => {
  if (!email) {
    return "patient";
  }

  const normalized = email.toLowerCase();
  if (normalized.includes("doctor") || normalized.includes("+doc") || normalized.endsWith("@medlink.id")) {
    return "doctor";
  }

  return "patient";
};

export function useSession(): SessionState {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [state, setState] = useState<SessionState>({
    status: "loading",
    session: null,
    user: null,
    role: "patient",
  });

  useEffect(() => {
    let isMounted = true;

    const resolve = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        setState({
          status: "unauthenticated",
          session: null,
          user: null,
          role: "patient",
        });
        return;
      }

      const session = data.session ?? null;
      const user = session?.user ?? null;
      setState({
        status: session ? "authenticated" : "unauthenticated",
        session,
        user,
        role: inferRoleFromEmail(user?.email ?? null),
      });
    };

    void resolve();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const user = session?.user ?? null;
      setState({
        status: session ? "authenticated" : "unauthenticated",
        session: session ?? null,
        user,
        role: inferRoleFromEmail(user?.email ?? null),
      });
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}
