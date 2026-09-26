"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Whether a horizontally scrolling box has content hidden on each side
// (26 Sep 2026). Pulled out of ScrollArrows so anything that scrolls sideways
// — the arrows, a Table's edge lines — reads it the same way.
//
//   const { ref, start, end, measure } = useScrollEdges<HTMLDivElement>();
//   <div ref={ref} onScroll={measure} className="overflow-x-auto">…</div>
//
// `start` = there is more to the left, `end` = more to the right. `bar` is the
// height of the box's own horizontal scrollbar, for whatever is drawn beside it.
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false, bar: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 1px of slack: browsers round, and otherwise the end stays "hidden"
    // forever at the end of the track.
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    const bar = el.offsetHeight - el.clientHeight;
    setEdges((e) => (e.start === start && e.end === end && e.bar === bar ? e : { start, end, bar }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    // Both the box (its width changes) and the content (it grows or shrinks)
    // must be watched: with only one, the edges fall out of sync.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return { ref, measure, ...edges };
}
