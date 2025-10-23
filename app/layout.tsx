import type { Metadata } from "next";
import "./globals.css";
import { ToastProviderContext } from "@/components/ui/use-toast";
import { GlobalCommandPalette } from "@/components/features/command/command-palette";
import { SeedBootstrap } from "@/components/dev/seed-bootstrap";

export const metadata: Metadata = {
  title: "MedLink AI",
  description: "Marketplace telemedicine dengan AI triage dan apotek digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased transition-colors">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-button focus:border focus:border-border/60 focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-md">Skip to content</a>
        <ToastProviderContext>
          <main id="main-content">
            {children}
          </main>
          {/* Global command palette (opens with Cmd/Ctrl+K or K) */}
          <GlobalCommandPalette />
          {/* Client bootstrap to apply mock seeds and demo flags */}
          <SeedBootstrap />
        </ToastProviderContext>
      </body>
    </html>
  );
}
