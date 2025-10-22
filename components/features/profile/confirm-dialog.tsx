"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  destructive = true,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <>
            <Dialog.Overlay asChild>
              <motion.div
                key="confirm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                key="confirm-content"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
              >
                <div className="w-full max-w-md rounded-card border border-border/60 bg-card p-6 shadow-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          destructive
                            ? "bg-danger/10 text-danger"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <Dialog.Title className="text-base font-semibold text-foreground">
                          {title}
                        </Dialog.Title>
                        <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                          {description}
                        </Dialog.Description>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="tap-target rounded-full border border-border/60 bg-muted/40 p-2 text-muted-foreground transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label="Tutup konfirmasi"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="tap-target inline-flex items-center justify-center rounded-button border border-border/60 bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {cancelLabel}
                      </button>
                    </Dialog.Close>
                    <button
                      type="button"
                      onClick={() => {
                        onConfirm();
                        onOpenChange(false);
                      }}
                      className={cn(
                        "tap-target inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-semibold text-white shadow-md transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        destructive
                          ? "bg-danger hover:bg-danger/90"
                          : "bg-primary hover:bg-primary-dark",
                      )}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}

