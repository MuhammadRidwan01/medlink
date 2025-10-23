"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toggleSlot, subscribeSchedule, getState, type Slot } from "./store";

type Cell = { date: string; time: string };

const TIMES = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export function AvailabilityGrid() {
  const [slots, setSlots] = useState<Slot[]>(getState().slots);
  useEffect(() => subscribeSchedule((s) => setSlots(s.slots)), []);

  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  const downRef = useRef<Cell | null>(null);
  const dragging = useRef(false);

  const isOpen = (date: string, time: string) => slots.some((s) => s.date === date && s.time === time && s.status !== "held");

  const onPointerDown = (c: Cell) => (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    downRef.current = c;
    toggleSlot(c.date, c.time);
  };
  const onPointerEnter = (c: Cell) => () => {
    if (!dragging.current) return;
    toggleSlot(c.date, c.time);
  };
  const onPointerUp = () => {
    dragging.current = false;
    downRef.current = null;
  };

  const onKeyDown = (c: Cell) => (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleSlot(c.date, c.time);
    }
  };

  return (
    <div className="overflow-x-auto rounded-card border border-border/60 bg-card p-2 shadow-sm">
      <table className="w-full border-collapse text-sm" role="grid" aria-label="Availability grid">
        <thead>
          <tr>
            <th className="p-2 text-left text-xs text-muted-foreground">Time</th>
            {days.map((d) => (
              <th key={d} className="p-2 text-left text-xs text-muted-foreground">{new Date(d).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit" })}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIMES.map((t) => (
            <tr key={t}>
              <td className="p-2 text-xs text-muted-foreground">{t}</td>
              {days.map((d) => {
                const open = isOpen(d, t);
                return (
                  <td key={`${d}-${t}`} className="p-1">
                    <div
                      role="gridcell"
                      aria-label={`${new Date(d).toDateString()} ${t}`}
                      tabIndex={0}
                      onKeyDown={onKeyDown({ date: d, time: t })}
                      onPointerDown={onPointerDown({ date: d, time: t })}
                      onPointerEnter={onPointerEnter({ date: d, time: t })}
                      onPointerUp={onPointerUp}
                      className={`h-8 rounded-button border ${open ? "border-primary/30 bg-primary/10" : "border-border/60 bg-muted/20"}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
