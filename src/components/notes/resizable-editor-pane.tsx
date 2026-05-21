"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_WIDTH = 448;
const MIN_WIDTH = 360;
const MAX_WIDTH = 720;

function clampWidth(width: number) {
  return Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
}

export function ResizableEditorPane({ children }: { children: ReactNode }) {
  const dragStart = useRef<{ width: number; x: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const startResize = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      dragStart.current = { width, x: event.clientX };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [width],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function resize(event: PointerEvent) {
      if (!dragStart.current) {
        return;
      }

      setWidth(
        clampWidth(
          dragStart.current.width + (dragStart.current.x - event.clientX),
        ),
      );
    }

    function stopResize() {
      dragStart.current = null;
      setIsDragging(false);
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResize);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stopResize);
    };
  }, [isDragging]);

  return (
    <section
      className="relative min-h-[calc(100vh-2rem)] w-full lg:w-(--editor-pane-width)"
      style={{ "--editor-pane-width": `${width}px` } as CSSProperties}
    >
      <button
        aria-label="Resize editor"
        className="absolute inset-y-0 -left-2 hidden w-4 cursor-col-resize items-center justify-center lg:flex"
        onPointerDown={startResize}
        type="button"
      >
        <span
          className={`h-16 w-1 rounded-full bg-border transition-colors ${
            isDragging ? "bg-primary" : "hover:bg-primary/60"
          }`}
        />
      </button>
      {children}
    </section>
  );
}
