"use client";

type EventMap = {
  "prescription:add": {
    id: string;
    name: string;
    code: string;
    strengths: string[];
    defaultDose: string;
    defaultFrequency: string;
    defaultDuration: string;
  };
  "followup:suggest": {
    consultId: string;
    patientName?: string;
    date?: string; // ISO date suggestion
  };
};

type Handler<T> = (payload: T) => void;

class TinyBus {
  private handlers: { [K in keyof EventMap]?: Set<Handler<EventMap[K]>> } = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    if (!this.handlers[event]) this.handlers[event] = new Set();
    this.handlers[event]!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    this.handlers[event]?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}

export const consultationBus = new TinyBus();
