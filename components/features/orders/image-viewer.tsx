"use client";

import { useCallback, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

type Props = {
  src: string;
  alt?: string;
};

export function ImageViewer({ src, alt }: Props) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((s) => Math.max(0.2, Math.min(5, s + delta)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setTx((v) => v + dx);
    setTy((v) => v + dy);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  return (
    <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-card border border-border/60 bg-black">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
        <button className="tap-target rounded-button border border-border/60 bg-muted/40 p-2 text-white/90 hover:bg-muted/60" onClick={() => setScale((s) => Math.min(5, s + 0.1))} aria-label="Zoom in">
          <Plus className="h-4 w-4" />
        </button>
        <button className="tap-target rounded-button border border-border/60 bg-muted/40 p-2 text-white/90 hover:bg-muted/60" onClick={() => setScale((s) => Math.max(0.2, s - 0.1))} aria-label="Zoom out">
          <Minus className="h-4 w-4" />
        </button>
        <button className="tap-target rounded-button border border-border/60 bg-muted/40 p-2 text-white/90 hover:bg-muted/60" onClick={reset} aria-label="Reset view">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
      <div
        className="relative flex h-full items-center justify-center"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <img
          src={src}
          alt={alt ?? "Imaging preview"}
          className="select-none"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "center center" }}
          draggable={false}
        />
      </div>
    </div>
  );
}
