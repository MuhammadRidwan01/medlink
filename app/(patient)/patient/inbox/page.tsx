"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { InboxMessage, type Message } from "@/components/features/notifications/inbox-message";
import { MessageComposer } from "@/components/features/notifications/message-composer";
import { NotificationToast } from "@/components/features/notifications/notification-toast";
import { cn } from "@/lib/utils";

type Room = {
  id: string;
  name: string; // doctor name or assistant
  specialty?: string;
  unread?: number;
  messages: Message[];
};

const initialRooms: Room[] = [
  {
    id: "r-dr-sinta",
    name: "dr. Sinta, Sp.PD",
    specialty: "Penyakit Dalam",
    unread: 0,
    messages: [
      {
        id: "m1",
        author: "doctor",
        content: "Halo, bagaimana kondisi hari ini? Ada keluhan demam atau batuk?",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: "r-dr-bayu",
    name: "dr. Bayu, Sp.JP",
    specialty: "Jantung",
    unread: 2,
    messages: [
      {
        id: "m2",
        author: "doctor",
        content: "Bagaimana tekanan darah pagi ini?",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: "m3",
        author: "doctor",
        content: "Jangan lupa catat detak jantung saat istirahat ya.",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ],
  },
  {
    id: "r-asisten",
    name: "Asisten MedLink",
    specialty: "Asisten Virtual",
    unread: 0,
    messages: [
      {
        id: "m4",
        author: "doctor",
        content: "Halo! Saya asisten MedLink. Ada yang bisa saya bantu?",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
  },
];

export default function InboxPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [activeId, setActiveId] = useState<string>(initialRooms[0].id);
  const [showListOnMobile, setShowListOnMobile] = useState<boolean>(true);

  const activeRoom = useMemo(() => rooms.find((r) => r.id === activeId)!, [rooms, activeId]);
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [activeRoom?.messages.length]);

  const handleSend = (text: string) => {
    const now = new Date();
    const newMsg: Message = {
      id: `m-${now.getTime()}`,
      author: "patient",
      content: text,
      timestamp: now.toISOString(),
    };
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeId
          ? { ...room, messages: [...room.messages, newMsg], unread: 0 }
          : room,
      ),
    );
    // mock doctor reply
    const canned = `Baik, terima kasih. Bisa jelaskan lebih detail: sejak kapan, intensitas (0–10), dan gejala penyerta?`;
    setTimeout(() => {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === activeId
            ? {
                ...room,
                messages: [
                  ...room.messages,
                  { id: `m-${Date.now() + 1}`, author: "doctor", content: canned, timestamp: new Date().toISOString() },
                ],
              }
            : room,
        ),
      );
    }, 700);
  };

  return (
    <PageShell title="Inbox" subtitle="Pilih percakapan dan lanjutkan chat dengan dokter" className="space-y-4">
      <NotificationToast />
      <div className="grid gap-6 md:grid-cols-[360px_minmax(0,1fr)]">
        {/* Rooms list */}
        <aside className={cn(
          "rounded-card border border-border/60 bg-card",
          showListOnMobile ? "block" : "hidden md:block",
        )}>
          <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <p className="text-lg font-semibold text-foreground">Percakapan</p>
          </header>
          <nav className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
            {rooms.map((room) => {
              const last = room.messages[room.messages.length - 1];
              const isActive = room.id === activeId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    setActiveId(room.id);
                    setShowListOnMobile(false);
                    // mark as read
                    setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, unread: 0 } : r)));
                  }}
                  className={cn(
                    "tap-target w-full rounded-button border px-5 py-4 text-left transition",
                    isActive ? "border-primary/40 bg-primary/10" : "border-transparent hover:border-border/60 hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary-dark text-sm font-bold text-white">
                      {room.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold text-foreground">{room.name}</p>
                      <p className="truncate text-base text-muted-foreground">{last?.content ?? ""}</p>
                    </div>
                    {room.unread ? (
                      <span className="ml-2 inline-flex h-7 min-w-7 items-center justify-center rounded-badge bg-primary/20 px-2 text-sm font-semibold text-primary">
                        {room.unread}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Active chat */}
        <section className={cn(
          "flex min-h-[60vh] flex-col gap-4 rounded-card border border-border/60 bg-card p-5",
          showListOnMobile ? "hidden md:flex" : "flex",
        )}>
          <header className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <p className="text-lg font-semibold text-foreground">{activeRoom.name}</p>
              {activeRoom.specialty ? (
                <p className="text-base text-muted-foreground">{activeRoom.specialty}</p>
              ) : null}
            </div>
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setShowListOnMobile(true)}
                className="tap-target rounded-button border border-border/60 bg-muted/20 px-3.5 py-2 text-base"
              >
                Kembali
              </button>
            </div>
          </header>
          <div ref={listRef} className="flex max-h-[70vh] flex-1 flex-col gap-5 overflow-y-auto">
            <div role="list" className="space-y-2">
              {activeRoom.messages.map((m) => (
                <InboxMessage key={m.id} message={m} />
              ))}
            </div>
          </div>
          <MessageComposer onSend={handleSend} />
        </section>
      </div>
    </PageShell>
  );
}

