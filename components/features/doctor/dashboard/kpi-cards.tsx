"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCard = {
  label: string;
  value: number;
  suffix?: string;
  delta?: {
    value: number;
    positive: boolean;
  };
};

type KpiCardsProps = {
  items: readonly KpiCard[];
};

function AnimatedCounter({ target }: { target: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame: number | undefined;
    const duration = 180;
    const start = performance.now();
    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplayValue(Math.round(progress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };
    animationFrame = requestAnimationFrame(tick);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target]);

  return <span>{displayValue}</span>;
}

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const DeltaIcon = item.delta?.positive ? TrendingUp : TrendingDown;
        return (
          <motion.article
            key={item.label}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            className="tap-target card-surface border border-border/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-semibold text-foreground">
                <AnimatedCounter target={item.value} />
                {item.suffix ? (
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    {item.suffix}
                  </span>
                ) : null}
              </p>
              {item.delta ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-badge border px-2.5 py-1 text-xs font-semibold",
                    item.delta.positive
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/30 bg-warning/10 text-warning",
                  )}
                >
                  <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.delta.positive ? "+" : "-"}
                  {item.delta.value}
                </span>
              ) : null}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
