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
  private handlers: Partial<
    Record<keyof EventMap, Set<Handler<EventMap[keyof EventMap]>>>
  > = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    const existing =
      (this.handlers[event] as Set<Handler<EventMap[K]>> | undefined) ??
      new Set<Handler<EventMap[K]>>();
    existing.add(handler);
    this.handlers[event] = existing as Set<
      Handler<EventMap[keyof EventMap]>
    >;
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    const existing = this.handlers[event] as
      | Set<Handler<EventMap[K]>>
      | undefined;
    existing?.delete(handler);
    if (existing && existing.size === 0) {
      delete this.handlers[event];
    }
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    const existing = this.handlers[event] as
      | Set<Handler<EventMap[K]>>
      | undefined;
    existing?.forEach((registeredHandler) => registeredHandler(payload));
  }
}

export const consultationBus = new TinyBus();
