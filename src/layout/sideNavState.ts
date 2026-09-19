"use client";

// Shared SideNav state WITHOUT a provider (useSyncExternalStore):
//   - open:      panel open on mobile (opened by the PageHeader hamburger)
//   - collapsed: compact mode on desktop (icons only), remembered in
//                localStorage
//   - mounted:   number of mounted SideNavs (if any, PageHeader draws ☰)
import { useEffect, useState, useSyncExternalStore } from "react";

type State = { mounted: number; open: boolean; collapsed: boolean };

const STORAGE_KEY = "adjeui.sidenav.collapsed";
const MOBILE_QUERY = "(max-width: 767px)"; // = Tailwind's md breakpoint

let state: State = { mounted: 0, open: false, collapsed: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const sideNavState = {
  open: () => set({ open: true }),
  close: () => set({ open: false }),
  toggle: () => set({ open: !state.open }),
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

const SERVER: State = { mounted: 0, open: false, collapsed: false };

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
