"use client";

export function KeyboardHints() {
  return (
    <div className="flex items-center justify-between rounded-card border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <Hint k="↑↓" label="Navigate" />
        <Hint k="Enter" label="Select" />
        <Hint k="Esc" label="Close" />
      </div>
      <div className="flex items-center gap-3">
        <Hint k="⌘K / Ctrl K" label="Open" />
      </div>
    </div>
  );
}

function Hint({ k, label }: { k: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <kbd className="rounded-badge border border-border/60 bg-muted/30 px-2 py-0.5 text-tiny text-muted-foreground">{k}</kbd>
      <span>{label}</span>
    </span>
  );
}

