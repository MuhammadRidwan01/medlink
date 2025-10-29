"use client";

import type { ReactNode } from "react";
import ToastProviderContext from "@/components/ui/use-toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return <ToastProviderContext>{children}</ToastProviderContext>;
}

export default AppProviders;
