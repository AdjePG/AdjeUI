"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { TONE_COLOR } from "../tokens/tone";

// Choosing, in one family. The SHAPE of the mark says how many you can
// choose: round = only one, square = several. On, the mark fills (app
// gradient or tone colour) and shows the check; the row gets a gradient border.
//
//   <ChoiceOption checked={a===1} onToggle={...}>Only one</ChoiceOption>
//   <ChoiceOption multiple checked={...} onToggle={...}>Several</ChoiceOption>
//   <ChoiceOption checked icon={<Car/>} mark={false}>Card</ChoiceOption>
//   <ChoiceOption checked tone="positive" align="center" icon={<Up/>}>Income</ChoiceOption>

const SIZES = {
  sm: { mark: "h-4 w-4", square: "rounded-[5px]", check: 10, row: "px-2.5 py-2 text-[13px]", gap: "gap-2" },
  md: { mark: "h-[18px] w-[18px]", square: "rounded-[6px]", check: 12, row: "px-3 py-2.5 text-sm", gap: "gap-3" },
  lg: { mark: "h-5 w-5", square: "rounded-[7px]", check: 13, row: "px-3.5 py-3 text-[15px]", gap: "gap-3" },
} as const;

export type ChoiceSize = keyof typeof SIZES;
export type ChoiceTone = "accent" | "positive" | "negative";

// "accent" is the app gradient, not a flat colour.
function colorFor(tone: ChoiceTone): string | undefined {
  return tone === "accent" ? undefined : TONE_COLOR[tone];
}

// Just the mark, for your own rows (a table, a custom list); the normal thing is ChoiceOption.
export function ChoiceMark({
  checked,
  multiple = false,
  size = "md",
  tone = "accent",
  className = "",
}: {
  checked: boolean;
  /** true = square (several can be chosen); false = round (only one). */
  multiple?: boolean;
  size?: ChoiceSize;
  tone?: ChoiceTone;
  className?: string;
}) {
  const t = SIZES[size];
  const color = colorFor(tone);
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center border-2 transition ${t.mark} ${
        multiple ? t.square : "rounded-full"
      } ${checked ? `border-transparent text-white ${color ? "" : "bg-app-gradient"}` : "border-[var(--border)]"} ${className}`}
      style={checked && color ? { background: color } : undefined}
    >
      <Check size={t.check} strokeWidth={3.5} className={`transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

export function ChoiceOption({
  checked,
  multiple = false,
  onToggle,
  disabled = false,
  icon,
  prefix,
  children,
  tone = "accent",
  mark = true,
  align = "start",
  size = "md",
  className = "",
}: {
  checked: boolean;
  /** true = several can be chosen (square mark); false = only one (round). */
  multiple?: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** Icon on the left, before the label. */
  icon?: ReactNode;
  /** Letter or number in front (A, B, C...), for quizzes. */
  prefix?: ReactNode;
  children: ReactNode;
  /** Color of the border and the mark: the app's, or semantic. */
  tone?: ChoiceTone;
  /** false = no mark on the left; the check moves to the right (card). */
  mark?: boolean;
  /** center for two-option grids. */
  align?: "start" | "center";
  size?: ChoiceSize;
  className?: string;
}) {
  const t = SIZES[size];
  const color = colorFor(tone);

  // Hover darkens the BORDER instead of filling the row: in the dark theme
  // --hover over a card is almost --border, and a filled row swallowed it.
  const frame = checked
    ? color
      ? "border-transparent"
      : "gradient-border"
    : "border-[var(--border)] hover:border-[color-mix(in_srgb,var(--foreground)_22%,transparent)]";

  const toneStyle =
    checked && color
      ? { borderColor: color, background: `color-mix(in srgb, ${color} 12%, transparent)`, color }
      : undefined;

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      style={toneStyle}
      className={`group flex w-full items-center rounded-xl border-2 text-left transition ${t.row} ${t.gap} ${frame} ${
        align === "center" ? "justify-center" : ""
      } ${disabled ? "cursor-default opacity-50" : "cursor-pointer"} ${checked ? "font-semibold" : ""} ${className}`}
    >
      {mark && (
        <ChoiceMark
          checked={checked}
          multiple={multiple}
          size={size}
          tone={tone}
          className={checked || disabled ? "" : "group-hover:border-[color-mix(in_srgb,var(--foreground)_40%,transparent)]"}
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {prefix != null && <span className="w-4 shrink-0 font-mono text-[11px] text-muted">{prefix}</span>}
      <span className={`min-w-0 ${align === "center" ? "" : "flex-1"}`}>{children}</span>
      {/* Without a mark on the left the check shows here: always ONE "chosen" signal. */}
      {!mark && checked && <Check size={15} className="ml-auto shrink-0" style={{ color: color ?? "var(--accent-blue)" }} />}
    </button>
  );
}
