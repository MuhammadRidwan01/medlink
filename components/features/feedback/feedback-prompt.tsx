"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dismissPrompt, getFeedback, isPromptDismissed, type FeedbackKind } from "./store";

export function FeedbackPrompt({ kind, id, openByDefault = false }: { kind: FeedbackKind; id: string; openByDefault?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(openByDefault);

  useEffect(() => {
    if (getFeedback(kind, id) || isPromptDismissed(kind, id)) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [kind, id]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside key="fb-sheet" className="fixed inset-x-0 bottom-0 z-40" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}>
          <div className="mx-auto w-full max-w-2xl rounded-t-card border border-border/60 bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Beri nilai pengalaman Anda</p>
              <button type="button" onClick={() => { dismissPrompt(kind, id); setOpen(false); }} className="tap-target rounded-button border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50">Nanti</button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Butuh 10 detik, membantu kami memperbaiki layanan.</p>
              <button type="button" onClick={() => { setOpen(false); router.push(kind === "order" ? `/patient/feedback/order/${id}` : `/patient/feedback/consultation/${id}`); }} className="tap-target rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg">Nilai sekarang</button>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

