import type { Metadata } from "next";
import "./globals.css";
import { ToastProviderContext } from "@/components/ui/use-toast";

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
        <ToastProviderContext>{children}</ToastProviderContext>
      </body>
    </html>
  );
}
