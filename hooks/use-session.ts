"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionState = {
  status: SessionStatus;
  session: Session | null;
  user: User | null;
  role: "patient" | "doctor";
};

function getRoleFromUser(user: User | null): "patient" | "doctor" {
  if (!user) return "patient";
  
  // Check metadata first (set by activation API)
  const metaRole = (user.user_metadata as any)?.role ?? (user.app_metadata as any)?.role;
  if (metaRole === "doctor") return "doctor";
  
  // Default to patient
  return "patient";
}

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
      const role = getRoleFromUser(user);

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
      const role = getRoleFromUser(user);

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
