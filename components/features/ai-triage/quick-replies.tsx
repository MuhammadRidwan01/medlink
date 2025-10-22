"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const variantClassMap = {
  primary:
    "border-primary/30 bg-primary/10 text-primary hover:border-primary/40 hover:bg-primary/15",
  outline:
    "border-border/60 bg-card text-foreground hover:border-primary/30 hover:text-primary",
  quiet:
    "border-transparent bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5",
} as const;

export type QuickReply = {
  id: string;
  label: string;
  variant?: keyof typeof variantClassMap;
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
          "interactive tap-target rounded-full border px-4 py-2 text-small font-medium transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
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
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type { QuickReply };
