"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  author: "doctor" | "patient";
  content: string;
  timestamp: string;
};

export function InboxMessage({ message }: { message: Message }) {
  const isDoctor = message.author === "doctor";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className={cn("flex", isDoctor ? "justify-start" : "justify-end")}>
      <div className={cn("max-w-[80%] rounded-card border p-5 text-lg shadow-sm", isDoctor ? "border-border/60 bg-card" : "border-primary/30 bg-primary/10 text-primary")}
        role="listitem"
        aria-label={isDoctor ? "Pesan dokter" : "Pesan Anda"}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="mt-1 text-right text-sm text-muted-foreground">{new Date(message.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
    </motion.div>
  );
}

export type { Message };

