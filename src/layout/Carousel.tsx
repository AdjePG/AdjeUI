"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollEdges } from "../controls/useScrollEdges";

// A row of anything — cards, figures, pictures — that stays ONE row (11 Oct
// 2026). While there is room, the items share the width equally; once they
// reach `itemWidth` they stop shrinking and the row scrolls sideways instead
// of wrapping or growing them back. No scrollbar: it moves with the finger or
// the trackpad, by dragging it with the mouse (it stays where you let go), or
// with a coloured button on the edge that has more, which moves one item
// along. `bleed` lets the row run out to the page's edge while it scrolls
// (pass the page's side padding), so the items are cut by the screen, not
// inside the margin; at rest they still line up with the content. `fade`
// also fades out the side with more to see.
//
//   <Carousel itemWidth={220} label="Figures" bleed="1rem">
//     <Stat … /> <Stat … /> <Stat … />
//   </Carousel>

export function Carousel({
  children,
  itemWidth = 220,
  label,
  fade = false,
  bleed,
  className = "",
}: {
  children: ReactNode;
  /** The smallest an item gets before the row starts scrolling (px). */
  itemWidth?: number;
  /** What the row is, for screen readers. */
  label?: string;
  /** Fade out the side that has more to see. */
  fade?: boolean;
  /** Run out this far past each side while scrolling: the page's side padding (px or any CSS length). */
  bleed?: number | string;
  className?: string;
}) {
  const { ref, measure, start, end } = useScrollEdges<HTMLDivElement>();
  const size = 56;
  const mask =
    fade && (start || end)
      ? `linear-gradient(to right, ${start ? "transparent" : "#000"} 0, #000 ${start ? size : 0}px, #000 calc(100% - ${end ? size : 0}px), ${end ? "transparent" : "#000"} 100%)`
      : undefined;

  const out = typeof bleed === "number" ? `${bleed}px` : bleed;

  // Where the buttons take the row: each item lined up with the content (past
  // the bleed and, with the fade, past the fade too, so the one you are on is
  // whole and only its neighbour peeks out under the fade and the button).
  const stops = () => {
    const el = ref.current;
    if (!el) return [];
    const pad = (parseFloat(getComputedStyle(el).paddingLeft) || 0) + (fade ? size : 0);
    const max = el.scrollWidth - el.clientWidth;
    return Array.from(el.children).map((c) => Math.min(max, Math.max(0, (c as HTMLElement).offsetLeft - pad)));
  };
  const goTo = (left: number) => ref.current?.scrollTo({ left, behavior: "smooth" });
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const all = stops();
    const at = el.scrollLeft;
    const next = dir === 1 ? all.find((x) => x > at + 2) : [...all].reverse().find((x) => x < at - 2);
    goTo(next ?? (dir === 1 ? el.scrollWidth : 0));
  };

  // Dragging with the mouse (a finger already scrolls natively): the row
  // follows the pointer and stays where you let go. A drag is not a click on
  // what is inside.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (e.pointerType !== "mouse" || e.button !== 0 || !el || el.scrollWidth <= el.clientWidth) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    const d = drag.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 5) return;
    if (!d.moved) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    }
    el.scrollLeft = d.left - dx;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    const d = drag.current;
    drag.current = null;
    if (!el || !d?.moved) return;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.style.cursor = "";
    // Swallow the click that ends the drag.
    el.addEventListener("click", (ev) => (ev.preventDefault(), ev.stopPropagation()), { capture: true, once: true });
  };

  return (
    <div
      className={`relative ${className}`}
      style={out ? { marginInline: `calc(-1 * ${out})` } : undefined}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      <div
        ref={ref}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
        className="relative grid grid-flow-col gap-4 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={
          {
            gridAutoColumns: `minmax(${itemWidth}px, 1fr)`,
            paddingInline: out,
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

// A small button in the app's colour — the same look as a primary Button —
// on an edge with more to see; it fades in and out rather than popping.
function EdgeButton({ side, show, onClick }: { side: "left" | "right"; show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      aria-label={side === "left" ? "Previous" : "Next"}
      title={side === "left" ? "Previous" : "Next"}
      className={`blue-shadow absolute top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white transition duration-200 hover:opacity-90 ${
        side === "left" ? "left-1" : "right-1"
      } ${show ? "opacity-100" : "pointer-events-none !opacity-0"}`}
      style={{ background: "var(--app-gradient)" }}
    >
      {side === "left" ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
    </button>
  );
}
