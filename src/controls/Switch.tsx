"use client";

// On/off toggle: "this is enabled or not". Choosing between options is
// ChoiceOption. Sizes sm / md / lg match the ChoiceOption mark, so the two read
// as relatives when they share a row.

const SIZES = {
  sm: { track: "h-4 w-7", knob: "h-2.5 w-2.5", off: "translate-x-[2px]", on: "translate-x-[13px]" },
  md: { track: "h-5 w-9", knob: "h-3.5 w-3.5", off: "translate-x-[2px]", on: "translate-x-[17px]" },
  lg: { track: "h-6 w-11", knob: "h-[18px] w-[18px]", off: "translate-x-[2px]", on: "translate-x-[21px]" },
} as const;

export type SwitchSize = keyof typeof SIZES;

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  size = "md",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /** aria-label. */
  label?: string;
  size?: SwitchSize;
}) {
  const t = SIZES[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${t.track} ${
        checked ? "bg-app-gradient border-transparent" : "border-[var(--border)]"
      }`}
    >
      <span
        className={`inline-block rounded-full shadow-sm transition-transform ${t.knob} ${
          checked ? `${t.on} bg-white` : `${t.off} bg-[var(--muted)]`
        }`}
      />
    </button>
  );
}
