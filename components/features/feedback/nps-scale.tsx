"use client";

export function NpsScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seberapa mungkin Anda merekomendasikan MedLink? (0-10)</p>
      <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Likelihood to recommend">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)} className={`tap-target rounded-button border px-3 py-1.5 text-sm ${value === n ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

