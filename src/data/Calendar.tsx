"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../controls/IconButton";
import { overlineCls } from "../primitives/Overline";

// A month, Monday first, always six weeks tall so moving between months never
// moves what is under it; the neighbouring months' days are greyed. Each cell
// is a template: its number (bold, centred) on top, whatever the caller puts
// in `content` in the middle, and badges (small dots whose label shows on
// hover) along the bottom. A day can also carry a colour that tints its cell.
// Today wears a ring in the gradient's lighter colour, the selected day one in
// the app's colour. The legend under it explains the colours (swatches) and
// the badges (dots).
//
//   <Calendar
//     days={[{ date: "2026-11-02", content: "8 h", color: palette("blue", 500), badges: [{ color: palette("orange", 600), label: "Holiday" }] }]}
//     selected={day} onSelect={setDay}
//     legend={[{ label: "Available", color: palette("blue", 500) }, { label: "Holiday", color: palette("orange", 600), kind: "dot" }]}
//   />

export type CalendarBadge = { color: string; label: string };

export type CalendarDay = {
  /** The day, as "YYYY-MM-DD" (local; see `calendarKey`). */
  date: string;
  /** What goes in the middle of the cell, centred: "8 h", a count, two short lines… */
  content?: ReactNode;
  /** Tints the cell (at `fill` %). */
  color?: string;
  badges?: CalendarBadge[];
};

export type CalendarLegendItem = {
  label: string;
  color: string;
  /** "swatch" (a cell's colour, the default) or "dot" (a badge). */
  kind?: "swatch" | "dot";
};

/** A local day as "YYYY-MM-DD", the key a CalendarDay is found by. */
export function calendarKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export function Calendar({
  days = [],
  month,
  defaultMonth,
  onMonthChange,
  selected,
  onSelect,
  today = new Date(),
  legend,
  fill = 45,
  locale = "en-GB",
  className = "",
}: {
  days?: CalendarDay[];
  /** The month shown (any day of it), when the caller keeps it. */
  month?: Date;
  /** The month it opens on when it keeps its own; today's month if not given. */
  defaultMonth?: Date;
  /** Called with the first day of the month moved to (arrows, or a day of another month picked). */
  onMonthChange?: (first: Date) => void;
  /** The selected day, "YYYY-MM-DD". */
  selected?: string | null;
  /** Makes the days clickable; called with the day, the neighbouring months' included. */
  onSelect?: (date: string) => void;
  /** Which day is today (ringed). */
  today?: Date;
  legend?: CalendarLegendItem[];
  /** How strongly a day's colour tints its cell, in %. */
  fill?: number;
  /** For the month's name and the weekdays. */
  locale?: string;
  className?: string;
}) {
  const [own, setOwn] = useState(() => firstOfMonth(defaultMonth ?? today));
  const shown = firstOfMonth(month ?? own);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const todayKey = calendarKey(today);

  function go(first: Date) {
    if (month == null) setOwn(first);
    onMonthChange?.(first);
  }

  // Six weeks from the Monday on or before the 1st.
  const start = new Date(shown.getFullYear(), shown.getMonth(), 1 - ((shown.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  // 1 Jan 2024 was a Monday.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }));

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <IconButton label="Previous month" onClick={() => go(new Date(shown.getFullYear(), shown.getMonth() - 1, 1))}>
          <ChevronLeft size={16} />
        </IconButton>
        <div className="text-base font-bold first-letter:uppercase">{shown.toLocaleDateString(locale, { month: "long", year: "numeric" })}</div>
        <IconButton label="Next month" onClick={() => go(new Date(shown.getFullYear(), shown.getMonth() + 1, 1))}>
          <ChevronRight size={16} />
        </IconButton>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((w) => (
          <div key={w} className={`${overlineCls} text-muted text-center`}>
            {w.replace(".", "")}
          </div>
        ))}
        {cells.map((d) => {
          const key = calendarKey(d);
          const day = byDate.get(key);
          const outside = d.getMonth() !== shown.getMonth();
          const ring = key === selected ? "ring-2 ring-inset ring-[var(--accent-blue)]" : key === todayKey ? "ring-2 ring-inset ring-[var(--accent-pink)]" : "";
          const body = (
            <>
              <span className={`text-xs font-bold tabular-nums ${outside ? "text-muted opacity-60" : ""}`}>{d.getDate()}</span>
              <span className="flex flex-1 items-center justify-center text-center text-sm leading-tight">{day?.content}</span>
              <span className="flex h-1.5 gap-1">
                {day?.badges?.map((b, i) => (
                  <span key={i} title={b.label} className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                ))}
              </span>
            </>
          );
          const look = `flex min-h-12 flex-col items-center rounded-lg px-1 py-1 sm:min-h-14 ${outside ? "opacity-70" : ""} ${ring}`;
          const tint = day?.color ? { background: `color-mix(in srgb, ${day.color} ${fill}%, transparent)` } : undefined;
          const label = d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
          return onSelect ? (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-pressed={key === selected}
              onClick={() => {
                onSelect(key);
                if (outside) go(firstOfMonth(d));
              }}
              className={`${look} transition ${tint ? "hover:brightness-110" : "hover:bg-[var(--hover)]"}`}
              style={tint}
            >
              {body}
            </button>
          ) : (
            <div key={key} aria-label={label} className={look} style={tint}>
              {body}
            </div>
          );
        })}
      </div>

      {!!legend?.length && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span
                className={l.kind === "dot" ? "h-2 w-2 rounded-full" : "h-3 w-3 rounded-[4px]"}
                style={{ background: l.kind === "dot" ? l.color : `color-mix(in srgb, ${l.color} ${fill}%, transparent)` }}
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
