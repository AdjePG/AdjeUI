"use client";

// Shared SideNav state WITHOUT a provider (useSyncExternalStore):
//   - open:      panel open on mobile (opened by the PageHeader hamburger)
//   - collapsed: compact mode on desktop (icons only), remembered in localStorage
//   - mounted:   number of mounted SideNavs (if any, PageHeader draws ☰)
//   - moving:    the mobile panel is sliding because someone opened or closed
//                it; the CSS slide only runs then, so crossing 768px while
//                resizing does not animate the panel over the page.
import { useSyncExternalStore } from "react";
import { useMediaQuery } from "../internal/useMediaQuery";

type State = { mounted: number; open: boolean; collapsed: boolean; moving: boolean };

const STORAGE_KEY = "adjeui.sidenav.collapsed";
/** = Tailwind's md breakpoint. */
export const MOBILE_QUERY = "(max-width: 767px)";

let state: State = { mounted: 0, open: false, collapsed: false, moving: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
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
  /** Shut at once, no slide: leaving the mobile size, so it does not come back open. */
  closeNow: () => {
    clearTimeout(movingTimer);
    set({ open: false, moving: false });
  },
  setCollapsed: (v: boolean) => {
    set({ collapsed: v });
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      // No storage (private mode, blocked): the choice lasts this visit.
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
        // No storage: expanded.
      }
    }
    set({ mounted: state.mounted + 1, collapsed });
  },
  unmount: () => set({ mounted: Math.max(0, state.mounted - 1), open: false }),
};

const SERVER: State = { mounted: 0, open: false, collapsed: false, moving: false };

/** The whole SideNav state. Prefer the selector hooks, which re-render less. */
export function useSideNavState(): State {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}

/** One value of the SideNav state; re-renders only when that value changes. */
export function useSideNavSelector<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(SERVER),
  );
}

/** Are we on mobile (< md)? False on the server. */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

/** Is the SideNav shown compact (icons only)? Desktop only: on mobile the sliding panel is always full. */
export function useSideNavCompact(): boolean {
  const collapsed = useSideNavSelector((s) => s.collapsed);
  const mobile = useIsMobile();
  return collapsed && !mobile;
}
