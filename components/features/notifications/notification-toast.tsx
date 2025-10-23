"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { notificationBus, type AppNotification } from "./store";

export function NotificationToast() {
  const { toast } = useToast();
  useEffect(() => {
    const off = notificationBus.on("notify:new", (n: AppNotification) => {
      toast({ title: n.title, description: n.description });
    });
    return off;
  }, [toast]);
  return <span className="sr-only" aria-live="polite" />;
}

