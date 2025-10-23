"use client";

export type FeedbackKind = "consultation" | "order";

export type FeedbackPayload = {
  id: string;
  kind: FeedbackKind;
  rating: number; // 0..5 (0.5 step)
  tags: string[];
  comment?: string;
  nps?: number; // 0..10
  contactOk?: boolean;
  testimonialOk?: boolean;
  createdAt: string; // ISO
};

export type FeedbackState = {
  completed: Record<string, FeedbackPayload>; // key `${kind}:${id}`
  dismissed: Record<string, boolean>;
};

const STORAGE_KEY = "ml-feedback-state-v1";

function load(): FeedbackState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, dismissed: {} };
    const parsed = JSON.parse(raw) as FeedbackState;
    return { completed: parsed.completed ?? {}, dismissed: parsed.dismissed ?? {} };
  } catch {
    return { completed: {}, dismissed: {} };
  }
}

let state: FeedbackState = { completed: {}, dismissed: {} };
try { state = load(); } catch { /* noop */ }

const EVENT = "feedback:update";

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
  const ev = new CustomEvent<FeedbackState>(EVENT, { detail: state });
  window.dispatchEvent(ev);
}

export function submitFeedback(payload: FeedbackPayload) {
  const key = `${payload.kind}:${payload.id}`;
  state.completed[key] = payload;
  state.dismissed[key] = true; // also prevents re-prompt
  save();
}

export function dismissPrompt(kind: FeedbackKind, id: string) {
  const key = `${kind}:${id}`;
  state.dismissed[key] = true;
  save();
}

export function getFeedback(kind: FeedbackKind, id: string) {
  const key = `${kind}:${id}`;
  return state.completed[key] ?? null;
}

export function isPromptDismissed(kind: FeedbackKind, id: string) {
  const key = `${kind}:${id}`;
  return Boolean(state.dismissed[key]);
}

export function subscribeFeedback(cb: (s: FeedbackState) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<FeedbackState>).detail);
  window.addEventListener(EVENT, handler);
  // fire initial
  cb(state);
  return () => window.removeEventListener(EVENT, handler);
}

