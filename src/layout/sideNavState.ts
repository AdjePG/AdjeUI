"use client";

// Shared SideNav state WITHOUT a provider (useSyncExternalStore):
//   - open:      panel open on mobile (opened by the PageHeader hamburger)
//   - collapsed: compact mode on desktop (icons only), remembered in
//                localStorage
//   - mounted:   number of mounted SideNavs (if any, PageHeader draws ☰)
//   - moving:    the mobile panel is sliding because someone opened or closed
//                it. The slide (CSS transition) only runs then: crossing the
//                768px line while resizing used to animate the panel out over
//                whatever was on screen, a full-screen preview included
//                (4 Oct 2026).
import { useEffect, useState, useSyncExternalStore } from "react";

type State = { mounted: number; open: boolean; collapsed: boolean; moving: boolean };

const STORAGE_KEY = "adjeui.sidenav.collapsed";
const MOBILE_QUERY = "(max-width: 767px)"; // = Tailwind's md breakpoint

let state: State = { mounted: 0, open: false, collapsed: false, moving: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

// The slide lasts 0.22s (theme.css); the flag outlives it a little.
let movingTimer: ReturnType<typeof setTimeout> | undefined;
function slide(open: boolean) {
  if (open === state.open) return;
  clearTimeout(movingTimer);
  set({ open, moving: true });
  movingTimer = setTimeout(() => set({ moving: false }), 260);
}

export const sideNavState = {
  open: () => slide(true),
  close: () => slide(false),
  toggle: () => slide(!state.open),
  // Shut at once, no slide: leaving the mobile size. The panel being open is
  // a mobile thing — kept open across a resize, it came back open, backdrop
  // and all, the next time the window got narrow (4 Oct 2026).
  closeNow: () => {
    clearTimeout(movingTimer);
    set({ open: false, moving: false });
  },
  setCollapsed: (v: boolean) => {
    set({ collapsed: v });
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      /* no storage */
    }
  },
  toggleCollapsed: () => sideNavState.setCollapsed(!state.collapsed),
  mount: () => {
    // Read the saved preference the first time (client only).
    let collapsed = state.collapsed;
    if (state.mounted === 0) {
      try {
        collapsed = localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        /* no storage */
      }
    }
    set({ mounted: state.mounted + 1, collapsed });
  },
  unmount: () => set({ mounted: Math.max(0, state.mounted - 1), open: false }),
};

const SERVER: State = { mounted: 0, open: false, collapsed: false, moving: false };

export function useSideNavState(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER
  );
}

// Are we on mobile (< md)? Client only; on the server it returns false.
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

// Is the SideNav being shown compact (icons only)? Desktop only: on mobile
// the sliding panel is always full.
export function useSideNavCompact(): boolean {
  const { collapsed } = useSideNavState();
  const mobile = useIsMobile();
  return collapsed && !mobile;
}
