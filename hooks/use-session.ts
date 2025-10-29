"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { deriveRoleFromMetadata, type UserRole } from "@/lib/auth/role";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionState = {
  status: SessionStatus;
  session: Session | null;
  user: Session["user"] | null;
  role: UserRole;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    session: null,
    user: null,
    role: "patient",
  });

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error("[useSession] Error getting session:", error);
        setState({
          status: "unauthenticated",
          session: null,
          user: null,
          role: "patient",
        });
        return;
      }

      const user = session?.user ?? null;
      const role = deriveRoleFromMetadata(user);

      setState({
        status: session ? "authenticated" : "unauthenticated",
        session,
        user,
        role,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const user = session?.user ?? null;
      const role = deriveRoleFromMetadata(user);

      setState({
        status: session ? "authenticated" : "unauthenticated",
        session,
        user,
        role,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
