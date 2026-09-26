"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollEdges } from "./useScrollEdges";

// Row that does not fit (13 Sep 2026): instead of a scrollbar —ugly, different
// on every OS and invisible on Mac until you touch it— two arrows appear at
// the ends. Each one shows ONLY if there is content left on that side, so as
// soon as everything fits both disappear and leave no trace.
//
// Wraps any horizontal row:
//   <ScrollArrows><div className="flex gap-2">...</div></ScrollArrows>
//
// Tabs and Segmented use it internally; it also works on its own.

export function ScrollArrows({
  children,
  className = "",
  step = 140,
}: {
  children: ReactNode;
  className?: string;
  /** Pixels advanced per press. */
  step?: number;
}) {
  const { ref, measure, start: left, end: right } = useScrollEdges<HTMLDivElement>();

  function move(dir: -1 | 1) {
    ref.current?.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      <div ref={ref} onScroll={measure} className="no-scrollbar overflow-x-auto overscroll-x-contain">
        {children}
      </div>

      {left && <Arrow side="left" onClick={() => move(-1)} />}
      {right && <Arrow side="right" onClick={() => move(1)} />}
    </div>
  );
}

// The arrow (26 Sep 2026): a bare chevron on a gradient veil fading into the
// background — no circle around it. The round bordered button looked like a
// control of its own sitting on the row; the veil already says "more this
// way", and the chevron is what you press.
function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const isLeft = side === "left";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-10 flex items-stretch ${isLeft ? "left-0 pr-5" : "right-0 pl-5"}`}
      style={{
        background: `linear-gradient(to ${isLeft ? "right" : "left"}, var(--card) 45%, transparent)`,
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={isLeft ? "Scroll left" : "Scroll right"}
        onClick={onClick}
        className="pointer-events-auto inline-flex w-6 items-center justify-center text-muted transition hover:text-[var(--foreground)]"
      >
        {isLeft ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  );
}
