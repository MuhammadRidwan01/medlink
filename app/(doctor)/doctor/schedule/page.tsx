"use client";

import { PageShell } from "@/components/layout/page-shell";
import { AvailabilityGrid } from "@/components/features/schedule/availability-grid";
import { AppointmentList } from "@/components/features/schedule/appointment-list";

export default function DoctorSchedulePage() {
  return (
    <PageShell title="Schedule" subtitle="Kelola ketersediaan dan janji temu" className="space-y-6">
      <AvailabilityGrid />
      <AppointmentList />
    </PageShell>
  );
}

