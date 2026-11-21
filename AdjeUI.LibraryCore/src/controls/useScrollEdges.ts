"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Whether a horizontally scrolling box has content hidden on each side, read
// the same way by everything that scrolls sideways (ScrollArrows, Table, Carousel).
//
//   const { ref, start, end, measure } = useScrollEdges<HTMLDivElement>();
//   <div ref={ref} onScroll={measure} className="overflow-x-auto">…</div>
//
// `start` = there is more to the left, `end` = more to the right. `bar` is the
// height of the box's own horizontal scrollbar and `sideBar` the width of its
// vertical one (a box that also scrolls down), for whatever is drawn beside them;
// `above` and `below` say the same as `start` and `end` for a box that scrolls down.
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false, above: false, below: false, bar: 0, sideBar: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 1px of slack: browsers round, and otherwise the end stays "hidden"
    // forever at the end of the track.
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    const above = el.scrollTop > 1;
    const below = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    const bar = el.offsetHeight - el.clientHeight;
    const sideBar = el.offsetWidth - el.clientWidth;
    setEdges((e) =>
      e.start === start && e.end === end && e.above === above && e.below === below && e.bar === bar && e.sideBar === sideBar
        ? e
        : { start, end, above, below, bar, sideBar },
    );
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
