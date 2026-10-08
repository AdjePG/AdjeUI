"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A scrollbar that floats over the content instead of taking a column of its
// own (4 Oct 2026). The native one reserved 14px down the right edge of the
// scrolling <main> — beside the sticky page header too, so the header, which
// is meant to reach the edge with the content showing through it, came out
// 14px short. With this one the box scrolls as before but draws no bar; a thin
// thumb is laid over its right edge instead, and it starts UNDER the sticky
// header, never beside it.
//
//   <main ref={ref} className="overlay-scroll overflow-y-auto">…</main>
//   <OverlayScrollbar target={ref} />
//
// `.overlay-scroll` (theme.css) hides the native bar and its gutter. The thumb
// takes the colour of --scrollbar-thumb where it is drawn (document level),
// can be dragged, and is hidden when there is nothing to scroll.

const WIDTH = 6;
const EDGE = 4; // gap to the box's right edge
const PAD = 4; // gap at both ends of the track
const MIN = 32; // shortest thumb

type Box = { top: number; left: number; height: number } | null;

// What is pinned to the top of the box (the page header): the track starts
// below it. Read from the layout, not from where it is drawn (5 Oct 2026): a
// page that comes in moving (a fade with a few pixels of rise) has its header
// a few pixels down while it does, and for that frame the track began at the
// very top, over the header. A sticky header at top 0 whose scroll box is
// this one is pinned to its top, wherever the animation draws it.
function stickyTop(el: HTMLElement): number {
  for (const h of Array.from(el.querySelectorAll<HTMLElement>("header"))) {
    const cs = getComputedStyle(h);
    if (cs.position !== "sticky" || parseFloat(cs.top) !== 0 || !h.offsetHeight) continue;
    if (scrollBox(h, el) === el) return h.offsetHeight;
  }
  return 0;
}

// The box an element sticks in: its nearest ancestor that scrolls (or clips).
function scrollBox(node: HTMLElement, stop: HTMLElement): HTMLElement | null {
  for (let p = node.parentElement; p; p = p.parentElement) {
    if (p === stop) return p;
    const o = getComputedStyle(p).overflowY;
    if (o === "auto" || o === "scroll" || o === "hidden") return p;
  }
  return null;
}

export function OverlayScrollbar({
  target,
  portal = true,
}: {
  target: RefObject<HTMLElement | null>;
  /** false = drawn where it is placed instead of in <body>: inside a layer of
   *  its own (a full-screen preview), so it sits in that layer and takes the
   *  colour variables of whatever wraps it. */
  portal?: boolean;
}) {
  const [box, setBox] = useState<Box>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; scroll: number; ratio: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollHeight - el.clientHeight;
      const style = getComputedStyle(el);
      if (max <= 1 || style.overflowY === "hidden") return setBox(null);
      const r = el.getBoundingClientRect();
      const inset = stickyTop(el);
      const trackTop = r.top + inset + PAD;
      const trackH = r.height - inset - PAD * 2;
      const thumbH = Math.max(MIN, (trackH * el.clientHeight) / el.scrollHeight);
      const top = trackTop + ((trackH - thumbH) * el.scrollTop) / max;
      setBox({ top, left: r.right - EDGE - WIDTH, height: thumbH });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // The content changes height (a page swaps in, a panel opens): watch the
    // box and whatever is directly inside it, re-watched when that changes.
    const ro = new ResizeObserver(schedule);
    const watch = () => {
      ro.disconnect();
      ro.observe(el);
      Array.from(el.children).forEach((c) => ro.observe(c));
      schedule();
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true });
    // Class changes (a page claiming the viewport sets overflow: hidden).
    const ao = new MutationObserver(schedule);
    ao.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      mo.disconnect();
      ao.disconnect();
    };
  }, [target]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = target.current;
    if (!el || !box) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const inset = stickyTop(el);
    const trackH = r.height - inset - PAD * 2;
    const max = el.scrollHeight - el.clientHeight;
    drag.current = { y: e.clientY, scroll: el.scrollTop, ratio: max / Math.max(1, trackH - box.height) };
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = target.current;
    const d = drag.current;
    if (!el || !d) return;
    el.scrollTop = d.scroll + (e.clientY - d.y) * d.ratio;
  }
  function onPointerUp() {
    drag.current = null;
    setDragging(false);
  }

  if (!mounted || !box) return null;
  const thumb = (
    <div
      aria-hidden
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="group fixed z-[45] flex cursor-default justify-center"
      // A wider hit area than the thumb, so it is easy to grab.
      style={{ top: box.top, left: box.left - 4, width: WIDTH + 8, height: box.height }}
    >
      <div
        className={`h-full rounded-full transition-[width,background-color] duration-150 ${
          dragging
            ? "w-2 bg-[var(--scrollbar-thumb-hover)]"
            : "w-1.5 bg-[var(--scrollbar-thumb)] group-hover:w-2 group-hover:bg-[var(--scrollbar-thumb-hover)]"
        }`}
      />
    </div>
  );
  return portal ? createPortal(thumb, document.body) : thumb;
}
