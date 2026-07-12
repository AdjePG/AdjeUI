"use client";

// Design system compartido por MisFinanzas y Adje Store (librería AdjeUI).
// Cualquier cambio aquí afecta a AMBAS apps: probar las dos tras editar.
// Los colores de identidad (--app-gradient, --accent-*, etc.) los define cada
// app en su globals.css; aquí solo se consumen via var(--...).

import { ReactNode, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, HelpCircle, X } from "lucide-react";

// ---------------- Card ----------------
export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`card p-4 sm:p-5 ${glow ? "blue-shadow" : ""} ${className}`}>{children}</div>
  );
}

// ---------------- Icon chip (identidad: degradado de la app) ----------------
export function IconChip({ children, size = "md" }: { children: ReactNode; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "w-8 h-8 rounded-xl" : "w-7 h-7 rounded-lg";
  return (
    <span
      className={`inline-flex items-center justify-center text-white shrink-0 ${cls}`}
      style={{ background: "var(--app-gradient)" }}
    >
      {children}
    </span>
  );
}

// ---------------- Section title ----------------
export function SectionTitle({
  icon,
  title,
  subtitle,
  help,
  right,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  help?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 className="text-[17px] font-semibold flex items-center gap-2.5">
          {icon && <IconChip>{icon}</IconChip>}
          {title}
          {help && <HelpTip>{help}</HelpTip>}
        </h2>
        {subtitle && <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

// ---------------- Help tooltip (¿qué es esto?) ----------------
// Solo hover. El contenido (children) puede ser texto o JSX con formato
// (<p>, <ul><li>, <b>...): se estiliza automáticamente.
export function HelpTip({ children, label }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  // Posición calculada al abrir y ANCLADA al viewport (position: fixed), así el
  // globo nunca se sale por el borde derecho: se centra bajo el icono pero se
  // recorta a [8px, ancho-8px]. Fixed además escapa del recorte de las tarjetas.
  function show() {
    if (timer.current) clearTimeout(timer.current);
    const el = ref.current;
    if (el && typeof window !== "undefined") {
      const r = el.getBoundingClientRect();
      const width = Math.min(272, window.innerWidth - 16);
      let left = r.left + r.width / 2 - width / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      setCoords({ left, top: r.bottom + 8, width });
    }
    setOpen(true);
  }
  function hide() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <span
      ref={ref}
      className="relative inline-flex align-middle"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        tabIndex={0}
        role="button"
        aria-label={label ?? "Más información"}
        className={`inline-flex items-center justify-center rounded-full transition-colors outline-none ${
          open ? "text-[var(--accent-blue)]" : "text-muted hover:text-[var(--accent-blue)]"
        }`}
      >
        <HelpCircle size={14} strokeWidth={2.25} />
      </span>
      {open && coords && (
        <span
          role="tooltip"
          className="fixed z-50 text-left cursor-default toast-in"
          style={{ left: coords.left, top: coords.top, width: coords.width }}
        >
          <span
            className="block rounded-2xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "0 16px 40px -10px rgba(0,0,0,0.5)",
            }}
          >
            <span className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--accent-blue)]">
              <HelpCircle size={12} strokeWidth={2.5} /> {label ?? "¿Qué es esto?"}
            </span>
            <span className="help-body block px-3.5 pb-3 pt-0.5 text-[13px] leading-relaxed text-[var(--foreground)]">
              {children}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}

// ---------------- Stat card ----------------
export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  help,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "accent";
  help?: ReactNode;
  icon?: ReactNode;
}) {
  const color =
    tone === "positive"
      ? "text-[var(--positive)]"
      : tone === "negative"
      ? "text-[var(--negative)]"
      : tone === "accent"
      ? "app-gradient-text"
      : "";
  return (
    <Card className="flex flex-col gap-1">
      <div className="text-[13px] text-muted flex items-center gap-1.5">
        {icon && <span className="inline-flex">{icon}</span>}
        {label}
        {help && <HelpTip>{help}</HelpTip>}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {hint && <div className="text-[12px] text-muted">{hint}</div>}
    </Card>
  );
}

// ---------------- Control segmentado (pestañas/filtros tipo toggle) ----------------
// Un único estilo para TODOS los toggles de la app (filtros, pestañas, vistas).
export function Segmented({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: ReactNode; icon?: ReactNode; title?: string }[];
  className?: string;
}) {
  return (
    <div className={`inline-flex rounded-xl border border-[var(--border)] overflow-hidden text-[13px] shrink-0 ${className}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.title}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 transition ${
              active ? "text-white" : "hover:bg-[var(--hover)]"
            }`}
            style={active ? { background: "var(--app-gradient)" } : undefined}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- Tabs (subpáginas estilo pestaña, con subrayado) ----------------
// Para las subpestañas del header (p. ej. IRPF: Mis declaraciones / Guía fiscal).
// A diferencia de Segmented (píldora, para filtros/toggles), esto es una barra de
// pestañas de texto con subrayado degradado en la activa, estilo navegador/YouTube.
export function Tabs({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: ReactNode; icon?: ReactNode; title?: string }[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            title={o.title}
            className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition ${
              active ? "text-[var(--foreground)]" : "text-muted hover:text-[var(--foreground)]"
            }`}
          >
            {o.icon}
            {o.label}
            {active && (
              <span
                className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded-full"
                style={{ background: "var(--app-gradient)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- Pill / badge ----------------
export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{
        background: color ? `${color}22` : "var(--hover)",
        color: color ?? "var(--foreground)",
      }}
    >
      {children}
    </span>
  );
}

// ---------------- Button ----------------
export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "outline" | "danger";
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    primary: "text-white blue-shadow hover:opacity-90",
    ghost: "hover:bg-[var(--hover)]",
    outline: "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover)]",
    danger: "text-[var(--negative)] border border-[var(--negative)] hover:bg-[var(--negative)]/10",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${styles[variant]} ${className}`}
      style={variant === "primary" ? { background: "var(--app-gradient)" } : undefined}
    >
      {children}
    </button>
  );
}

// ---------------- Drawer lateral (para paneles de IA, editores, etc.) ----------------
export function Drawer({
  open,
  onClose,
  title,
  icon,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 drawer-fade" onClick={onClose} />
      <div
        className={`relative h-full w-full ${wide ? "sm:w-[640px]" : "sm:w-[440px]"} max-w-full bg-[var(--secondary)] border-l border-[var(--border)] shadow-2xl flex flex-col drawer-in`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
          <h3 className="font-semibold flex items-center gap-2">
            {icon && <IconChip>{icon}</IconChip>}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--hover)] inline-flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------- Modal ----------------
export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
      onMouseDown={onClose}
    >
      <div
        className={`card w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8 p-5 blue-shadow`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[var(--hover)] inline-flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------- Select personalizado ----------------
export function Select({
  value,
  onChange,
  options,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm bg-[var(--background)] transition ${
          open ? "border-[var(--accent-blue)]" : "border-[var(--border)] hover:border-[var(--accent-blue)]"
        }`}
      >
        <span className="truncate">{current?.label ?? placeholder ?? "—"}</span>
        <ChevronDown size={14} className={`text-muted shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[170px] card p-1 blue-shadow max-h-64 overflow-y-auto custom-scrollbar toast-in">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-[var(--hover)] transition ${
                o.value === value ? "font-semibold" : ""
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={14} className="text-[var(--accent-blue)] shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Form field ----------------
export function Field({
  label,
  children,
  help,
  right,
}: {
  label: string;
  children: ReactNode;
  help?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted flex items-center gap-1.5">
        {label}
        {help && <HelpTip>{help}</HelpTip>}
        {right && <span className="ml-auto">{right}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent-blue)]";

// ---------------- Piezas de formulario compartidas (diálogos consistentes) ----------------
// Toggle de DOS opciones con tono semántico (verde/rojo): Ingreso/Gasto, Compra/Venta.
// Va a lo ancho, arriba del formulario, con el mismo aspecto en todos los diálogos.
export function ChoiceToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode; tone: "positive" | "negative" }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const on = value === o.value;
        const color = o.tone === "positive" ? "var(--positive)" : "var(--negative)";
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold border-2 transition ${
              on ? "" : "border-[var(--border)] hover:bg-[var(--hover)]"
            }`}
            style={on ? { borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)`, color } : undefined}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// Tarjeta seleccionable (categoría, tipo de activo): borde de acento + check al
// elegir. Mismo aspecto en todos los diálogos.
export function PickCard({
  selected,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left border-2 transition ${
        selected ? "border-[var(--accent-blue)] bg-[var(--hover)]" : "border-[var(--border)] hover:bg-[var(--hover)]"
      }`}
    >
      {icon}
      <span className="text-sm font-semibold truncate">{label}</span>
      {selected && <Check size={15} className="ml-auto shrink-0 text-[var(--accent-blue)]" />}
    </button>
  );
}

// ---------------- Paginación ----------------
export function Pagination({
  page,
  pageCount,
  total,
  onPage,
  noun = "resultados",
}: {
  page: number; // 1-indexed
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
  noun?: string;
}) {
  if (pageCount <= 1) {
    return <div className="text-[13px] text-muted mt-3 pt-2 border-t border-[var(--border)]">{total} {noun}</div>;
  }
  return (
    <div className="flex items-center justify-between gap-2 text-[13px] text-muted mt-3 pt-2 border-t border-[var(--border)]">
      <span>{total} {noun}</span>
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-lg hover:bg-[var(--hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-1">
          Página <b className="text-[var(--foreground)]">{page}</b> de {pageCount}
        </span>
        <button
          className="p-1.5 rounded-lg hover:bg-[var(--hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ---------------- Empty state ----------------
export function Empty({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="text-center py-10 text-muted">
      {icon && <div className="mb-2 inline-flex text-muted [&>svg]:w-9 [&>svg]:h-9">{icon}</div>}
      <div className="font-semibold text-[var(--foreground)]">{title}</div>
      {children && <div className="text-[13px] mt-1">{children}</div>}
    </div>
  );
}
