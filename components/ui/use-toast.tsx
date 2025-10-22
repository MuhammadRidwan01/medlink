"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";

type ToastVariant = "default" | "destructive";

type ToastData = {
  id: number;
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toasts: ToastData[];
  dismiss: (id: number) => void;
  toast: (data: Omit<ToastData, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProviderContext({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((data: Omit<ToastData, "id">) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, ...data }]);
    if (data.duration !== 0) {
      const timeout = window.setTimeout(() => dismiss(id), data.duration ?? 4000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [dismiss]);

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      toast,
    }),
    [dismiss, toast, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider swipeDirection="up">
        {children}
        <ToastViewport />
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            className={
              toastItem.variant === "destructive"
                ? "border-danger/40 bg-danger text-white shadow-danger/40"
                : undefined
            }
            onOpenChange={(open) => {
              if (!open) {
                dismiss(toastItem.id);
              }
            }}
          >
            {toastItem.title ? <ToastTitle>{toastItem.title}</ToastTitle> : null}
            {toastItem.description ? (
              <ToastDescription>{toastItem.description}</ToastDescription>
            ) : null}
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProviderContext");
  }
  return context;
};

export type { ToastVariant };
