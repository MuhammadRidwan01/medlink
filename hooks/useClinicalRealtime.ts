"use client";

import { useEffect, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { DbClinicalOrder, DbPrescription } from "@/lib/clinical/types";

export type ClinicalRealtimeHandlers = {
  onPrescriptionStatusChange?: (prescription: DbPrescription) => void;
  onOrderInsert?: (order: DbClinicalOrder) => void;
  onOrderUpdate?: (order: DbClinicalOrder) => void;
};

export function useClinicalRealtime(handlers?: ClinicalRealtimeHandlers) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase.channel("clinical:*");

    // Prescriptions: watch status changes
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "clinical", table: "prescriptions" },
      (payload) => {
        const oldRow = payload.old as DbPrescription | null;
        const newRow = payload.new as DbPrescription;
        if (!oldRow || oldRow.status !== newRow.status) {
          handlers?.onPrescriptionStatusChange?.(newRow);
          toast({
            title: "Prescription updated",
            description: `Status: ${oldRow?.status ?? "?"} → ${newRow.status}`,
          });
        }
      },
    );

    // Clinical Orders: inserts
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "clinical", table: "clinical_orders" },
      (payload) => {
        const row = payload.new as DbClinicalOrder;
        handlers?.onOrderInsert?.(row);
        toast({
          title: "New clinical order",
          description: `${row.type.toUpperCase()}: ${row.name ?? "(unnamed)"} • ${row.status}`,
        });
      },
    );

    // Clinical Orders: updates
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "clinical", table: "clinical_orders" },
      (payload) => {
        const row = payload.new as DbClinicalOrder;
        handlers?.onOrderUpdate?.(row);
        toast({
          title: "Order updated",
          description: `${row.type.toUpperCase()}: ${row.name ?? "(unnamed)"} • ${row.status}`,
        });
      },
    );

    channel.subscribe((status) => {
      // Optionally handle status states if needed
      // console.debug("clinical channel status:", status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handlers, supabase, toast]);
}

