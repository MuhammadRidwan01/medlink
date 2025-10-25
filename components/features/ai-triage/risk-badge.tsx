import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/triage";

const riskConfig: Record<
  RiskLevel,
  {
    label: string;
    container: string;
    indicator: string;
  }
> = {
  low: {
    label: "Risiko Rendah",
    container: "border border-primary/20 bg-primary/5 text-primary",
    indicator: "bg-primary",
  },
  moderate: {
    label: "Risiko Sedang",
    container: "border border-warning/30 bg-warning/10 text-warning",
    indicator: "bg-warning",
  },
  high: {
    label: "Risiko Tinggi",
    container: "border border-danger/20 bg-danger/15 text-danger",
    indicator: "bg-danger",
  },
  emergency: {
    label: "Darurat",
    container: "border border-danger/40 bg-danger text-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)]",
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
        "inline-flex items-center gap-2 rounded-badge px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm",
        config.container,
        className,
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", config.indicator)} />
      {config.label}
    </span>
  );
}
