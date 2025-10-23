'use client';

import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { DateTimePicker } from "@/components/features/schedule/date-time-picker";
import { ConfirmationCard } from "@/components/features/schedule/confirmation-card";
import { bookAppointment } from "@/components/features/schedule/store";
import { useToast } from "@/components/ui/use-toast";

type FollowUpBookingPageClientProps = {
  consultId: string;
};

export function FollowUpBookingPageClient({
  consultId,
}: FollowUpBookingPageClientProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"pick" | "confirm">("pick");
  const [selection, setSelection] = useState<{ date: string; time: string }>({
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
  });

  return (
    <PageShell
      title="Jadwalkan Follow-up"
      subtitle="Pilih tanggal dan waktu"
      className="space-y-4"
    >
      {step === "pick" ? (
        <div className="space-y-4">
          <DateTimePicker value={selection} onChange={setSelection} />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setStep("confirm")}
              className="tap-target rounded-button bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      ) : (
        <ConfirmationCard
          patient="Anda"
          date={selection.date}
          time={selection.time}
          onAddReminder={() => {
            bookAppointment({
              consultId,
              patient: "Anda",
              date: selection.date,
              time: selection.time,
              reason: "Follow-up",
            });
            toast({
              title: "Follow-up dijadwalkan",
              description: `${selection.date} • ${selection.time}`,
            });
          }}
        />
      )}
    </PageShell>
  );
}
