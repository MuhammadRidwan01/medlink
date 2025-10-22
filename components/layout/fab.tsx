"use client";

import { motion } from "framer-motion";
import { MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FabProps = {
  href: string;
  label?: string;
  className?: string;
};

export function Fab({ href, label = "Mulai Konsultasi", className }: FabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed bottom-24 right-4 z-50 flex items-center justify-center md:bottom-8",
        className,
      )}
    >
      <Link
        href={href}
        className="interactive tap-target inline-flex items-center gap-3 rounded-full bg-primary-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30"
      >
        <MessageCirclePlus className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}

