"use client";

// Estado compartido del SideNav SIN provider (useSyncExternalStore):
//   - open:      panel abierto en móvil (lo abre la hamburguesa del PageHeader)
//   - collapsed: modo compacto en escritorio (solo iconos), se recuerda en
//                localStorage
//   - mounted:   nº de SideNav montados (si hay alguno, PageHeader pinta ☰)
import { useEffect, useState, useSyncExternalStore } from "react";

type State = { mounted: number; open: boolean; collapsed: boolean };

const STORAGE_KEY = "adjeui.sidenav.collapsed";
const MOBILE_QUERY = "(max-width: 767px)"; // = breakpoint md de Tailwind

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
      /* sin storage */
    }
  },
  toggleCollapsed: () => sideNavState.setCollapsed(!state.collapsed),
  mount: () => {
    // Leer la preferencia guardada la primera vez (solo cliente).
    let collapsed = state.collapsed;
    if (state.mounted === 0) {
      try {
        collapsed = localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        /* sin storage */
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

// ¿Estamos en móvil (< md)? Solo cliente; en servidor devuelve false.
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

// ¿El SideNav se está mostrando compacto (solo iconos)? Solo en escritorio:
// en móvil el panel deslizante siempre va completo.
export function useSideNavCompact(): boolean {
  const { collapsed } = useSideNavState();
  const mobile = useIsMobile();
  return collapsed && !mobile;
}
