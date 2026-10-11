"use client";

import type { CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollEdges } from "../controls/useScrollEdges";

// A row of anything — cards, figures, pictures — that stays ONE row (11 Oct
// 2026). While there is room, the items share the width equally; once they
// reach `itemWidth` they stop shrinking and the row scrolls sideways instead
// of wrapping or growing them back. It scrolls the way the device does
// (finger, trackpad, the thin bar under it), each item settles at its start,
// the side with more to see fades out, and a small round button sits on that
// edge to move one item along. Nothing to drag by hand.
//
//   <Carousel itemWidth={220} label="Figures">
//     <Stat … /> <Stat … /> <Stat … />
//   </Carousel>

export function Carousel({
  children,
  itemWidth = 220,
  label,
  className = "",
}: {
  children: ReactNode;
  /** The smallest an item gets before the row starts scrolling (px). */
  itemWidth?: number;
  /** What the row is, for screen readers. */
  label?: string;
  className?: string;
}) {
  const { ref, measure, start, end } = useScrollEdges<HTMLDivElement>();
  // The fade is a mask on the scrolling box, only on the side with more.
  const fade = 36;
  const mask =
    start || end
      ? `linear-gradient(to right, ${start ? "transparent" : "#000"} 0, #000 ${start ? fade : 0}px, #000 calc(100% - ${end ? fade : 0}px), ${end ? "transparent" : "#000"} 100%)`
      : undefined;

  // One item along: the first item's width and the gap.
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`} role={label ? "region" : undefined} aria-label={label}>
      <div
        ref={ref}
        onScroll={measure}
        className="code-scroll grid snap-x snap-proximity grid-flow-col gap-4 overflow-x-auto overflow-y-hidden [&>*]:snap-start"
        style={
          {
            gridAutoColumns: `minmax(${itemWidth}px, 1fr)`,
            WebkitMaskImage: mask,
            maskImage: mask,
          } as CSSProperties
        }
      >
        {children}
      </div>
      <EdgeButton side="left" show={start} onClick={() => move(-1)} />
      <EdgeButton side="right" show={end} onClick={() => move(1)} />
    </div>
  );
}

// A small round button on an edge with more to see: the card's own colour, a
// hairline and a soft shadow, so it reads as lying on top of the row; it
// fades in and out rather than popping.
function EdgeButton({ side, show, onClick }: { side: "left" | "right"; show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.25)] transition duration-200 hover:bg-[var(--hover)] ${
        side === "left" ? "left-1" : "right-1"
      } ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {side === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}
