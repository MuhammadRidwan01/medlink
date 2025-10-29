"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const variantClassMap = {
  primary:
    "border-primary/40 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent text-primary shadow-sm hover:border-primary/60 hover:from-primary/20 hover:via-primary/10",
  outline:
    "border-border/60 bg-card text-foreground shadow-sm hover:border-primary/40 hover:text-primary",
  quiet:
    "border-transparent bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5",
} as const;

export type QuickReply = {
  id: string;
  label: string;
  variant?: keyof typeof variantClassMap;
  icon?: LucideIcon;
  description?: string;
  hotkey?: string;
};

type QuickRepliesProps = {
  options: QuickReply[];
  onSelect: (option: QuickReply) => void;
  disabled?: boolean;
};

export function QuickReplies({ options, onSelect, disabled }: QuickRepliesProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (disabled) {
      setFocusedIndex(null);
    }
  }, [disabled]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = (index + 1) % options.length;
      buttonRefs.current[next]?.focus();
      setFocusedIndex(next);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = (index - 1 + options.length) % options.length;
      buttonRefs.current[prev]?.focus();
      setFocusedIndex(prev);
    } else if (event.key === "Home") {
      event.preventDefault();
      buttonRefs.current[0]?.focus();
      setFocusedIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = options.length - 1;
      buttonRefs.current[last]?.focus();
      setFocusedIndex(last);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(options[index]);
    }
  };

  if (!options.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" role="listbox" aria-label="Pilihan jawaban cepat">
      {options.map((option, index) => {
        const variant = option.variant ?? "primary";
        const baseClass =
          "interactive tap-target flex min-w-[180px] flex-1 flex-col gap-1 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-none";
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="option"
            aria-selected={focusedIndex === index}
            disabled={disabled}
            onClick={() => onSelect(option)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              baseClass,
              variantClassMap[variant],
              disabled && "cursor-not-allowed opacity-60 hover:shadow-none",
            )}
            aria-label={`Kirim jawaban cepat ${option.label}`}
          >
            <span className="flex items-center gap-2">
              {Icon ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-background/60">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
              ) : null}
              <span className="flex-1 text-sm font-semibold">{option.label}</span>
              {option.hotkey ? (
                <kbd className="ml-auto rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {option.hotkey}
                </kbd>
              ) : null}
            </span>
            {option.description ? (
              <span className="pl-10 text-xs font-normal text-muted-foreground">{option.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
