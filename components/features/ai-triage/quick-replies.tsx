"use client";

import { cn } from "@/lib/utils";

type QuickReply = {
  id: string;
  label: string;
};

type QuickRepliesProps = {
  options: QuickReply[];
  onSelect: (option: QuickReply) => void;
  disabled?: boolean;
};

export function QuickReplies({ options, onSelect, disabled }: QuickRepliesProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className={cn(
            "interactive tap-target rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-small font-medium text-primary transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            disabled && "cursor-not-allowed opacity-60 hover:shadow-none",
          )}
          aria-label={`Kirim jawaban cepat ${option.label}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type { QuickReply };

