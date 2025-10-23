"use client";

type Props = { status: "draft" | "scheduled" | "published"; scheduledAt?: string; onChange: (next: { status: Props["status"]; scheduledAt?: string }) => void };

export function SchedulePublish({ status, scheduledAt, onChange }: Props) {
  return (
    <div className="space-y-2 rounded-card border border-border/60 bg-card p-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
      <div className="flex items-center gap-2">
        {["draft","scheduled","published"].map((s) => (
          <button key={s} type="button" onClick={() => onChange({ status: s as Props["status"], scheduledAt })} className={`tap-target rounded-button border px-3 py-1.5 text-xs font-semibold ${status===s?"border-primary/30 bg-primary/10 text-primary":"border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>{s}</button>
        ))}
      </div>
      {status === "scheduled" ? (
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule (local timezone)
          <input type="datetime-local" value={scheduledAt ? scheduledAt.slice(0,16) : ""} onChange={(e) => onChange({ status, scheduledAt: new Date(e.target.value).toISOString() })} className="mt-1 w-full rounded-input border border-border/60 bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring" />
        </label>
      ) : null}
      <p className="text-tiny text-muted-foreground">Note: times are stored in UTC; shown in local timezone.</p>
    </div>
  );
}

