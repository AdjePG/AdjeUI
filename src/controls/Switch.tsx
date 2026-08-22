"use client";

// Interruptor booleano para ajustes y filtros. Encendido usa el degradado de
// la app; apagado, la superficie neutra con borde.
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition disabled:opacity-40 disabled:cursor-not-allowed"
      style={
        checked
          ? { background: "var(--app-gradient)", borderColor: "transparent" }
          : { background: "var(--hover)", borderColor: "var(--border)" }
      }
    >
      <span
        className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
