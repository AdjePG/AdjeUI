"use client";

// Barra de progreso fina (presupuestos, objetivos, subida de archivos).
// Por defecto usa el degradado de la app; tone la vuelve semántica.
export function ProgressBar({
  value,
  max = 100,
  tone = "accent",
  className = "",
}: {
  value: number;
  max?: number;
  tone?: "accent" | "positive" | "negative";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill =
    tone === "positive"
      ? "var(--positive)"
      : tone === "negative"
      ? "var(--negative)"
      : "var(--app-gradient)";
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`h-2 w-full rounded-full overflow-hidden bg-[var(--hover)] ${className}`}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%`, background: fill }}
      />
    </div>
  );
}
