"use client";

import { PageShell } from "@/components/layout/page-shell";
import { NotificationList } from "@/components/features/notifications/notification-list";
import { NotificationToast } from "@/components/features/notifications/notification-toast";

export default function NotificationCenterPage() {
  return (
    <PageShell title="Notifikasi" subtitle="Pemberitahuan sistem, pesan dokter, dan pengingat" className="space-y-6">
      <NotificationToast />
      <NotificationList />
    </PageShell>
  );
}

