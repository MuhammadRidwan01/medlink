"use client";

import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-muted/40 md:bg-background">
      <Header title="Marketplace" />
      <main className="relative flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}

