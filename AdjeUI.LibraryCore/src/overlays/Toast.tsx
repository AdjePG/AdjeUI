"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, LucideIcon, X, XCircle } from "lucide-react";
import { TONE_COLOR, type Tone } from "../tokens/tone";

type ToastType = "success" | "error" | "info" | "warning";

type ToastItem = { id: number; msg: string; type: ToastType };

const ToastCtx = createContext<{ toast: (msg: string, type?: ToastType) => void } | null>(null);

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const TONES: Record<ToastType, Tone> = { success: "positive", error: "negative", info: "accent", warning: "warning" };

const DURATION = 5000;

// Toast stack at the bottom right; each toast goes after 5 s or on click.
// The context value never changes, so toasting re-renders no consumer.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((s) => s.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, type: ToastType = "info") => {
      const id = nextId.current++;
      setItems((s) => [...s, { id, msg, type }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <ToastList items={items} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

function ToastList({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[min(360px,calc(100vw-2rem))]">
      {items.map((t) => {
        const Icon = ICONS[t.type];
        const color = TONE_COLOR[TONES[t.type]];
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onDismiss(t.id)}
            className="group card blue-shadow py-2.5 pl-2.5 pr-3 w-full flex items-center gap-2.5 text-left text-[13px] toast-in"
            title="Click to dismiss"
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
              style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
            >
              <Icon size={16} />
            </span>
            <span className="flex-1 leading-snug">{t.msg}</span>
            <X size={14} className="shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        );
      })}
    </div>
  );
}

/** `toast(message, type = "info")`. Needs a <ToastProvider> above. */
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
