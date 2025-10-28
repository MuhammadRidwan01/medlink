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
      // Default to patient for new users
      let role: "patient" | "doctor" = "patient";
      
      // Only promote to doctor if explicit evidence exists
      // Priority 1: Explicit cookie set after activation
      try {
        if (typeof document !== "undefined") {
          const match = document.cookie.match(/(?:^|; )role=([^;]+)/);
          if (match && decodeURIComponent(match[1]) === "doctor") {
            role = "doctor";
          }
        }
      } catch {}
      
      // Priority 2: Metadata (set by activation API)
      if (role === "patient") {
        const metaRole = (user?.user_metadata as any)?.role ?? (user?.app_metadata as any)?.role;
        if (metaRole === "doctor") role = "doctor";
      }
      
      // Set immediate state first to avoid long skeletons
      setState({
        status: session ? "authenticated" : "unauthenticated",
        session,
        user,
        role,
      });
      
      // Priority 3: Authoritative DB check (non-blocking): upgrade role if needed
      if (session && role === "patient") {
        try {
          const { data: isDoc } = await supabase.rpc("is_doctor");
          if (isDoc === true) {
            setState((prev) => ({ ...prev, role: "doctor" }));
          }
        } catch {}
      }
    };

    void resolve();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const user = session?.user ?? null;
      // Default to patient for new users
      let role: "patient" | "doctor" = "patient";
      
      // Only promote to doctor if explicit evidence exists
      // Priority 1: Explicit cookie set after activation
      try {
        if (typeof document !== "undefined") {
          const match = document.cookie.match(/(?:^|; )role=([^;]+)/);
          if (match && decodeURIComponent(match[1]) === "doctor") {
            role = "doctor";
          }
        }
      } catch {}
      
      // Priority 2: Metadata (set by activation API)
      if (role === "patient") {
        const metaRole = (user?.user_metadata as any)?.role ?? (user?.app_metadata as any)?.role;
        if (metaRole === "doctor") role = "doctor";
      }
      
      // Set immediate state
      setState({
        status: session ? "authenticated" : "unauthenticated",
        session: session ?? null,
        user,
        role,
      });
      
      // Priority 3: Upgrade role after RPC if still patient
      if (session && role === "patient") {
        try {
          const { data: isDoc } = await supabase.rpc("is_doctor");
          if (isDoc === true) {
            setState((prev) => ({ ...prev, role: "doctor" }));
          }
        } catch {}
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}
