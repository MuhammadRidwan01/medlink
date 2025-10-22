import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header title="MedLink AI" />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md overflow-hidden rounded-card border border-border/60 bg-card shadow-xl">
          <div className="h-2 w-full bg-primary-gradient" />
          <div className="space-y-6 px-6 py-8 sm:px-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
