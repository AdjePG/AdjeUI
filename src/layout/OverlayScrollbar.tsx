"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A scrollbar that floats over the content instead of taking a column of its
// own: the native one reserved 14px down the scrolling <main>, beside the
// sticky page header too, which then fell 14px short of the edge. The box
// scrolls as before with no bar; a thin thumb is laid over its right edge,
// starting UNDER the sticky header.
//
//   <main ref={ref} className="overlay-scroll overflow-y-auto">…</main>
//   <OverlayScrollbar target={ref} />
//
// `.overlay-scroll` (theme.css) hides the native bar and its gutter. The thumb
// takes --scrollbar-thumb, can be dragged, and hides when nothing scrolls.

const WIDTH = 6;
const EDGE = 4; // gap to the box's right edge
const PAD = 4; // gap at both ends of the track
const MIN = 32; // shortest thumb

type Box = { top: number; left: number; height: number } | null;

// Where the track lies, measured only when the layout may have changed (not
// on every scroll frame).
type Track = { top: number; height: number; left: number; hidden: boolean };

// What is pinned to the top of the box (the page header): the track starts
// below it. Read from the layout, not from where it is drawn, so a header
// still moving in with its page does not count as lower.
function stickyTop(el: HTMLElement): number {
  for (const h of Array.from(el.querySelectorAll<HTMLElement>("header"))) {
    const cs = getComputedStyle(h);
    if (cs.position !== "sticky" || parseFloat(cs.top) !== 0 || !h.offsetHeight) continue;
    if (scrollBox(h, el) === el) return h.offsetHeight;
  }
  return 0;
}

// Whether a finite CSS animation is running inside the box (a page fading
// in), whose movement can overflow the box for a moment. Transitions and
// endless animations (a spinner) do not count, or the thumb would never come back.
function entering(el: HTMLElement): boolean {
  if (typeof el.getAnimations !== "function" || typeof CSSAnimation === "undefined") return false;
  return el
    .getAnimations({ subtree: true })
    .some((a) => a instanceof CSSAnimation && a.playState === "running" && a.effect?.getTiming().iterations !== Infinity);
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

function measureTrack(el: HTMLElement): Track {
  const r = el.getBoundingClientRect();
  const inset = stickyTop(el);
  return {
    top: r.top + inset + PAD,
    height: r.height - inset - PAD * 2,
    left: r.right - EDGE - WIDTH,
    hidden: getComputedStyle(el).overflowY === "hidden" || entering(el),
  };
}

export function OverlayScrollbar({
  target,
  portal = true,
}: {
  target: RefObject<HTMLElement | null>;
  /** false = drawn where it is placed instead of in <body>: inside a layer of
   *  its own (a full-screen preview), so it takes that layer's colours. */
  portal?: boolean;
}) {
  const [box, setBox] = useState<Box>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; scroll: number; ratio: number } | null>(null);
  const track = useRef<Track | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    let stale = true;
    // A scroll frame only reads scroll positions; the track is re-measured
    // after a layout change.
    const update = () => {
      raf = 0;
      if (stale || !track.current) {
        track.current = measureTrack(el);
        stale = false;
      }
      const t = track.current;
      const max = el.scrollHeight - el.clientHeight;
      if (t.hidden || max <= 1) return setBox(null);
      const height = Math.max(MIN, (t.height * el.clientHeight) / el.scrollHeight);
      const top = t.top + ((t.height - height) * el.scrollTop) / max;
      setBox((b) => (b && b.top === top && b.left === t.left && b.height === height ? b : { top, left: t.left, height }));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const relayout = () => {
      stale = true;
      schedule();
    };
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout);
    // A page that comes in moving fires no resize: measure again when an
    // animation starts or ends, or a transition ends, inside the box.
    el.addEventListener("animationstart", relayout);
    el.addEventListener("animationend", relayout);
    el.addEventListener("animationcancel", relayout);
    el.addEventListener("transitionend", relayout);
    // The content changes height (a page swaps in, a panel opens): watch the
    // box and whatever is directly inside it, re-watched when that changes.
    const ro = new ResizeObserver(relayout);
    const watch = () => {
      ro.disconnect();
      ro.observe(el);
      Array.from(el.children).forEach((c) => ro.observe(c));
      relayout();
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true });
    // Class changes (a page claiming the viewport sets overflow: hidden).
    const ao = new MutationObserver(relayout);
    ao.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", relayout);
      el.removeEventListener("animationstart", relayout);
      el.removeEventListener("animationend", relayout);
      el.removeEventListener("animationcancel", relayout);
      el.removeEventListener("transitionend", relayout);
      ro.disconnect();
      mo.disconnect();
      ao.disconnect();
    };
  }, [target]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = target.current;
    const t = track.current;
    if (!el || !box || !t) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const max = el.scrollHeight - el.clientHeight;
    drag.current = { y: e.clientY, scroll: el.scrollTop, ratio: max / Math.max(1, t.height - box.height) };
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
