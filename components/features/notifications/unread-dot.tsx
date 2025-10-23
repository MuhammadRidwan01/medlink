"use client";

import { motion } from "framer-motion";

export function UnreadDot({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 rounded-full bg-primary"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}

