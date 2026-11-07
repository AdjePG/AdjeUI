"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../controls/IconButton";
import { Overline, overlineCls } from "../primitives/Overline";

// A month, Monday first, always six weeks tall so moving between months never
// moves what is under it; the neighbouring months' days are greyed. A day can
// carry a colour (its cell is tinted with it), up to three short lines (a
// value, a detail in the app's colour and a status) and badges, small dots
// whose label shows on hover. Today wears a ring in the gradient's lighter
// colour, the selected day one in the app's colour. The legend under it
// explains the colours (swatches) and the badges (dots).
//
//   <Calendar
//     days={[{ date: "2026-11-02", value: "8 h", detail: "2 shifts", status: "Full", color: palette("blue", 500) }]}
//     selected={day} onSelect={setDay}
//     legend={[{ label: "Available", color: palette("blue", 500) }, { label: "Holiday", color: palette("orange", 600), kind: "dot" }]}
//   />

export type CalendarBadge = { color: string; label: string };

export type CalendarDay = {
  /** The day, as "YYYY-MM-DD" (local; see `calendarKey`). */
  date: string;
  /** The day's main figure: "8 h", "2". */
  value?: ReactNode;
  /** A second line in the app's colour: "2 shifts". Hidden on narrow screens. */
  detail?: ReactNode;
  /** A small uppercase word: "Full", "Closed". Hidden on narrow screens. */
  status?: ReactNode;
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
              <span className={`text-xs tabular-nums ${outside ? "text-muted opacity-60" : key === todayKey ? "font-bold" : ""}`}>{d.getDate()}</span>
              <span className="flex flex-1 flex-col items-center justify-center self-stretch text-center leading-tight">
                {day?.value != null && <span className="text-sm font-semibold">{day.value}</span>}
                {day?.detail != null && <span className="hidden text-xs text-[var(--accent-blue)] sm:block">{day.detail}</span>}
                {day?.status != null && <Overline className="hidden sm:block">{day.status}</Overline>}
                {!!day?.badges?.length && (
                  <span className="mt-1 flex gap-1">
                    {day.badges.map((b, i) => (
                      <span key={i} title={b.label} className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
                    ))}
                  </span>
                )}
              </span>
            </>
          );
          const look = `flex min-h-14 flex-col items-start rounded-xl p-1.5 sm:min-h-20 ${outside ? "opacity-70" : ""} ${ring}`;
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
              className={`${look} text-left transition ${tint ? "hover:brightness-110" : "hover:bg-[var(--hover)]"}`}
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
