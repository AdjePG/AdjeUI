"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";

// CHOOSING, a single family (13 Sep 2026). There used to be three components
// for the same thing —PickCard, ChoiceToggle and ChoiceOption— each with its
// own look: the result was that within one app the chosen option was marked
// in three different ways. Now there is ONE, ChoiceOption, and the other two
// are retired.
//
// The language is the one that worked best (PickCard's): gradient border +
// check. And the SHAPE of the mark says how many you can choose:
//   · round   → only one (what used to be a radio)
//   · square  → several at once (what used to be a checkbox)
//
// The radio no longer has a center dot: on is a filled circle with a check,
// just like the checkbox. A dot and a check meant the same thing with two
// different drawings.
//
//   <ChoiceOption checked={a===1} onToggle={...}>Only one</ChoiceOption>
//   <ChoiceOption multiple checked={...} onToggle={...}>Several</ChoiceOption>
//   <ChoiceOption checked icon={<Car/>} mark={false}>Card (what PickCard did)</ChoiceOption>
//   <ChoiceOption checked tone="positive" align="center" icon={<Up/>}>Income</ChoiceOption>

const SIZES = {
  sm: { mark: "h-4 w-4", square: "rounded-[5px]", check: 10, row: "px-2.5 py-2 text-[13px]", gap: "gap-2" },
  md: { mark: "h-[18px] w-[18px]", square: "rounded-[6px]", check: 12, row: "px-3 py-2.5 text-sm", gap: "gap-3" },
  lg: { mark: "h-5 w-5", square: "rounded-[7px]", check: 13, row: "px-3.5 py-3 text-[15px]", gap: "gap-3" },
} as const;

export type ChoiceSize = keyof typeof SIZES;
export type ChoiceTone = "accent" | "positive" | "negative";

function colorFor(tone: ChoiceTone): string | undefined {
  return tone === "positive" ? "var(--positive)" : tone === "negative" ? "var(--negative)" : undefined;
}

// The mark: round if you choose one, square if you can choose several. When on
// it fills (with the app gradient, or with the tone color) and shows the
// check. Exported on its own for when you need the mark without the whole row
// —a table, a custom list— but the normal thing is to use ChoiceOption.
export function ChoiceMark({
  checked,
  multiple = false,
  size = "md",
  tone = "accent",
  className = "",
}: {
  checked: boolean;
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
      } ${checked ? "border-transparent text-white" : "border-[var(--border)]"} ${className}`}
      // backgroundOrigin border-box is REQUIRED here: the 2px border is
      // transparent and the gradient is painted underneath (clip border-box),
      // but by default the gradient is SIZED to the padding-box. Result: those
      // extra 2px repeated the edge color and drew a box inside the fill — the
      // seam that was visible between the border and the inner color.
      style={
        checked
          ? { backgroundImage: color ? `linear-gradient(${color}, ${color})` : "var(--app-gradient)", backgroundOrigin: "border-box" }
          : undefined
      }
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

  // Chosen: gradient border (or the tone color). Off: normal border.
  const frame = checked
    ? color
      ? "border-transparent"
      : "gradient-border"
    : "border-[var(--border)] hover:bg-[var(--hover)]";

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
      className={`flex w-full items-center rounded-xl border-2 text-left transition ${t.row} ${t.gap} ${frame} ${
        align === "center" ? "justify-center" : ""
      } ${disabled ? "cursor-default opacity-50" : "cursor-pointer"} ${checked ? "font-semibold" : ""} ${className}`}
    >
      {mark && <ChoiceMark checked={checked} multiple={multiple} size={size} tone={tone} />}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {prefix != null && <span className="w-4 shrink-0 font-mono text-[11px] text-muted">{prefix}</span>}
      <span className={`min-w-0 ${align === "center" ? "" : "flex-1"}`}>{children}</span>
      {/* Without a mark on the left, the check shows here: so there is always
          ONE "chosen" signal, never two or none. */}
      {!mark && checked && <Check size={15} className="ml-auto shrink-0" style={{ color: color ?? "var(--accent-blue)" }} />}
    </button>
  );
}
