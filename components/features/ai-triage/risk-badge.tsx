import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "moderate" | "high" | "emergency";

const riskConfig: Record<
  RiskLevel,
  { label: string; container: string; indicator: string }
> = {
  low: {
    label: "Risiko Rendah",
    container: "bg-accent/10 text-accent border border-accent/20",
    indicator: "bg-accent",
  },
  moderate: {
    label: "Risiko Sedang",
    container: "bg-warning/10 text-warning border border-warning/30",
    indicator: "bg-warning",
  },
  high: {
    label: "Risiko Tinggi",
    container: "bg-danger/10 text-danger border border-danger/30",
    indicator: "bg-danger",
  },
  emergency: {
    label: "Darurat",
    container: "bg-danger text-white border border-danger/40",
    indicator: "bg-white",
  },
};

type RiskBadgeProps = {
  level: RiskLevel;
  className?: string;
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-badge px-3 py-1 text-tiny font-semibold uppercase tracking-wide",
        config.container,
        className,
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", config.indicator)} />
      {config.label}
    </span>
  );
}

