"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 1px of slack: browsers round, and otherwise the right arrow stays on
    // forever at the end of the track.
    setLeft(el.scrollLeft > 1);
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    // Both the container (its width changes) and the content (its items
    // change) must be watched: with only one, the arrows fall out of sync.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

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

// The arrow sits on a gradient veil fading into the background, so the content
// underneath is not cut off with a hard edge.
function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const isLeft = side === "left";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 z-10 flex items-center ${isLeft ? "left-0 pr-6" : "right-0 pl-6"}`}
      style={{
        background: `linear-gradient(to ${isLeft ? "right" : "left"}, var(--card) 55%, transparent)`,
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={isLeft ? "Scroll left" : "Scroll right"}
        onClick={onClick}
        className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-muted shadow-sm transition hover:text-[var(--foreground)]"
      >
        {isLeft ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
}
