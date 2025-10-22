"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/components/ui/use-toast";
import { SessionSkeleton } from "./session-skeleton";

type SessionGateProps = {
  allowedRoles?: Array<"patient" | "doctor">;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function SessionGate({ allowedRoles, children, fallback }: SessionGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { status, user, role } = useSession();
  const hasToastedRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      if (!hasToastedRef.current && !pathname.startsWith("/(auth)")) {
        toast({
          title: "Silakan masuk dulu",
          description: "Harap masuk untuk melanjutkan konsultasi Anda.",
        });
        hasToastedRef.current = true;
      }
      const redirect = pathname;
      router.replace(`/(auth)/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [pathname, router, status, toast]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      user &&
      !allowedRoles.includes(role)
    ) {
      if (!hasToastedRef.current) {
        toast({
          title: "Akses terbatas",
          description: "Anda tidak memiliki akses ke halaman tersebut.",
          variant: "destructive",
        });
        hasToastedRef.current = true;
      }
      router.replace(role === "doctor" ? "/(doctor)/dashboard" : "/(patient)/dashboard");
    }
  }, [allowedRoles, role, router, status, toast, user]);

  if (status === "loading") {
    return fallback ?? <SessionSkeleton />;
  }

  if (status !== "authenticated" || !user) {
    return fallback ?? <SessionSkeleton />;
  }

  return <>{children}</>;
}
