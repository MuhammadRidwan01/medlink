"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SplitPaneProps = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  className?: string;
};

type HandleId = "left" | "right";

type Sizes = {
  left: number;
  center: number;
  right: number;
};

type DragState = {
  handle: HandleId;
  startX: number;
  startSizes: Sizes;
  containerWidth: number;
};

const DEFAULT_SIZES: Sizes = {
  left: 0.2,
  center: 0.55,
  right: 0.25,
};

const MIN_LEFT = 0.16;
const MAX_LEFT = 0.34;
const MIN_RIGHT = 0.18;
const MAX_RIGHT = 0.32;
const MIN_CENTER = 0.4;

const SNAP_INCREMENT = 0.05; // 5%

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const snapValue = (value: number) =>
  Math.round(value / SNAP_INCREMENT) * SNAP_INCREMENT;

export function SplitPane({ left, center, right, className }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setSizes] = useState<Sizes>(DEFAULT_SIZES);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const isDragging = Boolean(dragState);

  const applySnap = useCallback((current: Sizes): Sizes => {
    let nextLeft = clamp(snapValue(current.left), MIN_LEFT, MAX_LEFT);
    let nextRight = clamp(snapValue(current.right), MIN_RIGHT, MAX_RIGHT);
    let nextCenter = 1 - nextLeft - nextRight;

    if (nextCenter < MIN_CENTER) {
      const deficit = MIN_CENTER - nextCenter;
      if (nextLeft - MIN_LEFT > nextRight - MIN_RIGHT) {
        nextLeft = clamp(nextLeft - deficit, MIN_LEFT, MAX_LEFT);
      } else {
        nextRight = clamp(nextRight - deficit, MIN_RIGHT, MAX_RIGHT);
      }
      nextCenter = 1 - nextLeft - nextRight;
    }

    return {
      left: nextLeft,
      center: nextCenter,
      right: nextRight,
    };
  }, []);

  const updateSizes = useCallback(
    (handle: HandleId, deltaX: number, drag: DragState) => {
      const deltaRatio = drag.containerWidth
        ? deltaX / drag.containerWidth
        : 0;

      if (handle === "left") {
        const nextLeft = clamp(
          drag.startSizes.left + deltaRatio,
          MIN_LEFT,
          Math.min(MAX_LEFT, 1 - drag.startSizes.right - MIN_CENTER),
        );
        const nextCenter = 1 - nextLeft - drag.startSizes.right;
        setSizes({
          left: nextLeft,
          center: clamp(nextCenter, MIN_CENTER, 1 - nextLeft - MIN_RIGHT),
          right: drag.startSizes.right,
        });
      } else {
        const nextRight = clamp(
          drag.startSizes.right - deltaRatio,
          MIN_RIGHT,
          Math.min(MAX_RIGHT, 1 - drag.startSizes.left - MIN_CENTER),
        );
        const nextCenter = 1 - drag.startSizes.left - nextRight;
        setSizes({
          left: drag.startSizes.left,
          center: clamp(nextCenter, MIN_CENTER, 1 - drag.startSizes.left - MIN_RIGHT),
          right: nextRight,
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      updateSizes(dragState.handle, event.clientX - dragState.startX, dragState);
    };

    const handlePointerUp = (event: PointerEvent) => {
      event.preventDefault();
      setSizes((current) => applySnap(current));
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [applySnap, dragState, updateSizes]);

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, handle: HandleId) => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      setDragState({
        handle,
        startX: event.clientX,
        startSizes: sizes,
        containerWidth,
      });
    },
    [sizes],
  );

  const handleKeyAdjust = useCallback(
    (handle: HandleId, direction: "decrease" | "increase") => {
      const step = SNAP_INCREMENT;
      setSizes((prev) => {
        const adjustment = direction === "increase" ? step : -step;
          if (handle === "left") {
            const nextLeft = clamp(
            prev.left + adjustment,
            MIN_LEFT,
            Math.min(MAX_LEFT, 1 - prev.right - MIN_CENTER),
          );
          const nextCenter = 1 - nextLeft - prev.right;
          return applySnap({
            left: nextLeft,
            center: nextCenter,
            right: prev.right,
          });
        }

        const nextRight = clamp(
          prev.right - adjustment,
          MIN_RIGHT,
          Math.min(MAX_RIGHT, 1 - prev.left - MIN_CENTER),
        );
        const nextCenter = 1 - prev.left - nextRight;
        return applySnap({
          left: prev.left,
          center: nextCenter,
          right: nextRight,
        });
      });
    },
    [applySnap],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, handle: HandleId) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        handleKeyAdjust(handle, handle === "left" ? "decrease" : "increase");
      }
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        handleKeyAdjust(handle, handle === "left" ? "increase" : "decrease");
      }
      if (event.key === "Home") {
        event.preventDefault();
        setSizes((prev) =>
          applySnap({
            left: handle === "left" ? MIN_LEFT : prev.left,
            center: MIN_CENTER,
            right: handle === "right" ? MIN_RIGHT : prev.right,
          }),
        );
      }
      if (event.key === "End") {
        event.preventDefault();
        setSizes((prev) =>
          applySnap({
            left: handle === "left" ? MAX_LEFT : prev.left,
            center: MIN_CENTER,
            right: handle === "right" ? MAX_RIGHT : prev.right,
          }),
        );
      }
    },
    [applySnap, handleKeyAdjust],
  );

  const handleAria = useMemo(() => {
    return {
      left: {
        value: Math.round(sizes.left * 100),
        min: Math.round(MIN_LEFT * 100),
        max: Math.round(MAX_LEFT * 100),
      },
      right: {
        value: Math.round(sizes.right * 100),
        min: Math.round(MIN_RIGHT * 100),
        max: Math.round(MAX_RIGHT * 100),
      },
    };
  }, [sizes]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full min-h-[72vh] w-full items-stretch gap-4 overflow-hidden",
        className,
      )}
    >
      <motion.div
        layout
        style={{ flexBasis: `${sizes.left * 100}%` }}
        className={cn(
          "flex min-w-[260px] flex-col transition-[flex-basis] duration-normal ease-out",
          isDragging && dragState?.handle === "left" && "transition-none",
        )}
      >
        {left}
      </motion.div>

      <PaneHandle
        onPointerDown={(event) => startDrag(event, "left")}
        onKeyDown={(event) => handleKeyDown(event, "left")}
        ariaValue={handleAria.left.value}
        ariaMin={handleAria.left.min}
        ariaMax={handleAria.left.max}
        isActive={dragState?.handle === "left"}
      />

      <motion.div
        layout
        style={{ flexBasis: `${sizes.center * 100}%` }}
        className={cn(
          "flex min-w-[360px] flex-col transition-[flex-basis] duration-normal ease-out",
          isDragging && "transition-none",
        )}
      >
        {center}
      </motion.div>

      <PaneHandle
        onPointerDown={(event) => startDrag(event, "right")}
        onKeyDown={(event) => handleKeyDown(event, "right")}
        ariaValue={handleAria.right.value}
        ariaMin={handleAria.right.min}
        ariaMax={handleAria.right.max}
        isActive={dragState?.handle === "right"}
      />

      <motion.div
        layout
        style={{ flexBasis: `${sizes.right * 100}%` }}
        className={cn(
          "flex min-w-[280px] flex-col transition-[flex-basis] duration-normal ease-out",
          isDragging && dragState?.handle === "right" && "transition-none",
        )}
      >
        {right}
      </motion.div>
    </div>
  );
}

type PaneHandleProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  ariaValue: number;
  ariaMin: number;
  ariaMax: number;
  isActive: boolean;
};

function PaneHandle({
  onPointerDown,
  onKeyDown,
  ariaValue,
  ariaMin,
  ariaMax,
  isActive,
}: PaneHandleProps) {
  return (
    <div className="relative flex h-full items-stretch">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-border/60" />
      <motion.div
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
        aria-valuenow={ariaValue}
        aria-valuemin={ariaMin}
        aria-valuemax={ariaMax}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={cn(
          "tap-target relative z-10 flex w-4 cursor-col-resize items-center justify-center rounded-button border border-border/60 bg-card/90 text-muted-foreground shadow-sm transition-all duration-fast ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:bg-muted",
          isActive && "border-primary/40 bg-primary/10 text-primary shadow-md",
        )}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </motion.div>
    </div>
  );
}
