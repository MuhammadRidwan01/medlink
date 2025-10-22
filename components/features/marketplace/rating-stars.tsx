"use client";

import { Star } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  rating: number; // 0 - 5 scale
  count?: number;
  className?: string;
  id?: string;
};

const TOTAL_STARS = 5;

export const RatingStars = memo(function RatingStars({ rating, count, className, id }: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(rating, TOTAL_STARS));
  const fullStars = Math.floor(clamped);
  const hasHalf = clamped - fullStars >= 0.5;

  return (
    <div
      id={id}
      className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}
      role="img"
      aria-label={`Rating ${clamped.toFixed(1)} dari 5${count ? ` berdasarkan ${count} ulasan` : ""}`}
    >
      <span className="sr-only">Rating</span>
      {Array.from({ length: TOTAL_STARS }).map((_, index) => {
        const isFull = index < fullStars;
        const isHalf = !isFull && index === fullStars && hasHalf;
        return (
          <span key={index} className="relative inline-flex">
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                isFull ? "text-warning" : "text-border",
              )}
              aria-hidden="true"
              fill={isFull ? "currentColor" : "none"}
            />
            {isHalf ? (
              <Star
                className="absolute inset-0 h-4 w-4 text-warning"
                style={{ clipPath: "inset(0 50% 0 0)" }}
                aria-hidden="true"
                fill="currentColor"
              />
            ) : null}
          </span>
        );
      })}
      {count ? <span aria-hidden="true">({count})</span> : null}
    </div>
  );
});
