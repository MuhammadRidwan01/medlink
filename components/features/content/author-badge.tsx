"use client";

export function AuthorBadge({ name, role }: { name: string; role?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-button border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
      <span className="inline-block h-6 w-6 rounded-full bg-primary/20" aria-hidden="true" />
      <span>
        <span className="font-semibold text-foreground">{name}</span>
        {role ? <span className="ml-1">• {role}</span> : null}
      </span>
    </span>
  );
}

