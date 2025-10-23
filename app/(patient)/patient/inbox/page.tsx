"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { InboxMessage, type Message } from "@/components/features/notifications/inbox-message";
import { MessageComposer } from "@/components/features/notifications/message-composer";
import { NotificationToast } from "@/components/features/notifications/notification-toast";

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "m1",
    author: "doctor",
    content: "Halo, bagaimana perasaan Anda hari ini? Tolong catat tekanan darah pagi ini.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  }]);
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages.length]);

  return (
    <PageShell title="Inbox" subtitle="Percakapan Anda dengan dokter" className="space-y-4">
      <NotificationToast />
      <div ref={listRef} className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-card border border-border/60 bg-card p-3">
        <div role="list" className="space-y-2">
          {messages.map((m) => (
            <InboxMessage key={m.id} message={m} />
          ))}
        </div>
      </div>
      <MessageComposer onSend={(text) => setMessages((cur) => [...cur, { id: `m-${Date.now()}`, author: "patient", content: text, timestamp: new Date().toISOString() }])} />
    </PageShell>
  );
}

