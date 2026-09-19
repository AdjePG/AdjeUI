"use client";

// On/off toggle. On uses the app gradient; off, the neutral surface with a
// border.
//
// Mind when to use it: the Switch says "this is enabled or not". For choosing
// between options —one or several— it is ChoiceOption. If both share the same
// row they have to read as relatives, not as two things of the same weight:
// that is why the switch was resized on 13 Sep 2026 to match the ChoiceOption
// mark (before, an md was 24px tall against the 18px of the mark next to it,
// and it looked like the main element of the row without being so).
//
// Sizes sm / md / lg, the same scale as ChoiceOption.

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
      className={`relative inline-flex shrink-0 items-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${t.track}`}
      // backgroundOrigin border-box: the 2px border is transparent and the
      // gradient is painted underneath, but by default it is SIZED to the
      // padding-box and those 2px repeat the edge color — a clipped box was
      // visible inside the track. Same reason as in ChoiceMark.
      style={
        checked
          ? { backgroundImage: "var(--app-gradient)", backgroundOrigin: "border-box", borderColor: "transparent" }
          : { background: "transparent", borderColor: "var(--border)" }
      }
    >
      <span
        className={`inline-block rounded-full shadow-sm transition-transform ${t.knob} ${
          checked ? t.on : t.off
        }`}
        style={{ background: checked ? "#fff" : "var(--muted)" }}
      />
    </button>
  );
}
