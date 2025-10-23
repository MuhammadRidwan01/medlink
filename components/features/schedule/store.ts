"use client";

export type SlotStatus = "open" | "held" | "booked";

export type Slot = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: SlotStatus;
};

export type Appointment = {
  id: string;
  consultId?: string;
  patient: string;
  reason?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: "scheduled" | "completed" | "canceled";
};

type StoreState = {
  slots: Slot[];
  appointments: Appointment[];
};

const STORAGE_KEY = "ml-schedule-store-v1";
const EVENT_KEY = "schedule:update";

let state: StoreState = { slots: [], appointments: [] };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw) as StoreState;
  } catch {}
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  const ev = new CustomEvent<StoreState>(EVENT_KEY, { detail: state });
  window.dispatchEvent(ev);
}

if (typeof window !== "undefined") {
  load();
  if (!state.slots.length) {
    // seed: next 7 days 9:00-11:00 open hourly
    const today = new Date();
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const ds = date.toISOString().slice(0, 10);
      ["09:00", "10:00", "11:00"].forEach((t) =>
        state.slots.push({ id: `${ds}-${t}`, date: ds, time: t, status: "open" }),
      );
    }
    save();
  }
}

export function subscribeSchedule(cb: (s: StoreState) => void) {
  const h = (e: Event) => cb((e as CustomEvent<StoreState>).detail);
  window.addEventListener(EVENT_KEY, h);
  cb(state);
  return () => window.removeEventListener(EVENT_KEY, h);
}

export function getState(): StoreState {
  return state;
}

export function toggleSlot(date: string, time: string) {
  const id = `${date}-${time}`;
  const idx = state.slots.findIndex((s) => s.id === id);
  if (idx >= 0) {
    // remove slot if open
    const slot = state.slots[idx]!;
    if (slot.status === "open") state.slots.splice(idx, 1);
  } else {
    state.slots.push({ id, date, time, status: "open" });
  }
  save();
}

export function bookAppointment(input: { consultId?: string; patient: string; date: string; time: string; reason?: string }) {
  const id = `apt-${Date.now()}`;
  const ap: Appointment = { id, consultId: input.consultId, patient: input.patient, date: input.date, time: input.time, reason: input.reason, status: "scheduled" };
  state.appointments.unshift(ap);
  // mark slot booked
  const sid = `${input.date}-${input.time}`;
  const s = state.slots.find((x) => x.id === sid);
  if (s) s.status = "booked";
  else state.slots.push({ id: sid, date: input.date, time: input.time, status: "booked" });
  save();
  return ap.id;
}

export function cancelAppointment(id: string) {
  const a = state.appointments.find((x) => x.id === id);
  if (a) a.status = "canceled";
  const s = state.slots.find((x) => x.date === a?.date && x.time === a?.time);
  if (s) s.status = "open";
  save();
}

export function completeAppointment(id: string) {
  const a = state.appointments.find((x) => x.id === id);
  if (a) a.status = "completed";
  save();
}

