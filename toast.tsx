"use client";

import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, LucideIcon, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  msg: string;
  type: ToastType;
}

const ToastCtx = createContext<{ toast: (msg: string, type?: ToastType) => void } | null>(null);

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};
const COLORS: Record<ToastType, string> = {
  success: "var(--positive)",
  error: "var(--negative)",
  info: "var(--accent-blue)",
  warning: "#e0a025",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((msg: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((s) => [...s, { id, msg, type }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[min(360px,calc(100vw-2rem))]">
        {items.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <button
              key={t.id}
              onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}
              className="group card blue-shadow py-2.5 pl-2.5 pr-3 w-full flex items-center gap-2.5 text-left text-[13px] toast-in"
              title="Pulsar para cerrar"
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                style={{ background: `color-mix(in srgb, ${COLORS[t.type]} 15%, transparent)`, color: COLORS[t.type] }}
              >
                <Icon size={16} />
              </span>
              <span className="flex-1 leading-snug">{t.msg}</span>
              <X
                size={14}
                className="shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
