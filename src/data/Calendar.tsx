"use client";

import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "../controls/IconButton";
import { Overline } from "../primitives/Overline";

// A month, Monday first, always six weeks (42 cells) so moving between months
// never moves what is under it. The neighbouring months' days are dimmed and
// carry no data. Every cell is the same template: its number (bold, centred)
// on top, whatever the caller puts in `content` in the middle, and badges
// (small dots) along the bottom. A day can be filled with one colour or with stacked bands,
// and can have a `tooltip`: a card that follows the pointer with the date on
// top, as a chart's does. Today wears a ring in the gradient's lighter colour,
// the selected day one in the app's colour. An optional legend explains the
// colours (swatches) and the badges (dots). It sizes its type by its own width
// (styles in theme.css, `.calendar`) and is never narrower than 18 rem.
//
//   <Calendar
//     days={[{ date: "2026-11-02", content: "8 h", color: palette("blue", 500), tooltip: "2 shifts" }]}
//     selected={day} onSelect={setDay}
//   />

export type CalendarBadge = { color: string; label: string };

/** A slice of a day's fill, from the top; without `percent` the bands share what is left. "transparent" leaves it empty. */
export type CalendarBand = { color: string; percent?: number };

export type CalendarDay = {
  /** The day, as "YYYY-MM-DD" (local; see `calendarKey`). */
  date: string;
  /** What goes in the middle of the cell, centred: "8 h", a count, two short lines… */
  content?: ReactNode;
  /** Fills the cell (at `fill` %). */
  color?: string;
  /** Fills the cell with stacked bands instead of one colour. */
  bands?: CalendarBand[];
  badges?: CalendarBadge[];
  /** Shown under the date in a card that follows the pointer over the day: CalendarTipRow lines. */
  tooltip?: ReactNode;
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

/** A line of a day's tooltip: a dot in the badge's colour (when given), what it is, and a short value at the end ("23:59"). */
export function CalendarTipRow({ color, label, value }: { color?: string; label: ReactNode; value?: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {color && <span className="calendar__badge shrink-0" style={{ "--calendar-badge": color } as CSSProperties} />}
      <span className="min-w-0 max-w-56 truncate">{label}</span>
      {value != null && <span className="ml-auto pl-3 tabular-nums text-muted">{value}</span>}
    </div>
  );
}

const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const tint = (color: string, fill: number) => (color === "transparent" ? "transparent" : `color-mix(in srgb, transparent, ${color} ${fill}%)`);

function bandsFill(bands: CalendarBand[], fill: number): string {
  const claimed = bands.reduce((n, b) => n + Math.max(0, b.percent ?? 0), 0);
  const unsized = bands.filter((b) => b.percent == null).length;
  const spare = Math.max(0, 100 - claimed);
  const scale = claimed > 100 ? 100 / claimed : 1;
  let at = 0;
  const stops = bands.map((b) => {
    const share = b.percent != null ? Math.max(0, b.percent) * scale : unsized && spare ? spare / unsized : 100 / bands.length;
    const end = Math.min(100, at + share);
    const stop = `${tint(b.color, fill)} ${at.toFixed(2)}% ${end.toFixed(2)}%`;
    at = end;
    return stop;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

export function Calendar({
  days = [],
  month,
  defaultMonth,
  onMonthChange,
  selected,
  onSelect,
  today = new Date(),
  legend,
  fill = 50,
  loading = false,
  showNavigation = true,
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
  /** How strongly a day's colour fills its cell, in %. */
  fill?: number;
  /** Dimmed and not clickable while the month's days load; the cells stay where they are. */
  loading?: boolean;
  /** The arrows to the previous and next month. */
  showNavigation?: boolean;
  /** For the month's name, the weekdays and the tooltip's date. */
  locale?: string;
  className?: string;
}) {
  const [own, setOwn] = useState(() => firstOfMonth(defaultMonth ?? today));
  const shown = firstOfMonth(month ?? own);
  const byDate = new Map(days.map((d) => [d.date, d]));
  const todayKey = calendarKey(today);
  const [hover, setHover] = useState<{ key: string; x: number; y: number } | null>(null);

  function go(first: Date) {
    if (month == null) setOwn(first);
    onMonthChange?.(first);
  }

  // The tooltip follows the pointer, where the eye is; it is drawn on the body, so no card clips it.
  const track = (e: MouseEvent, key: string) => setHover({ key, x: e.clientX, y: e.clientY });

  // Six weeks from the Monday on or before the 1st.
  const start = new Date(shown.getFullYear(), shown.getMonth(), 1 - ((shown.getDay() + 6) % 7));
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const key = calendarKey(d);
    const inMonth = d.getMonth() === shown.getMonth();
    return { d, key, inMonth, day: inMonth ? byDate.get(key) : undefined };
  });
  const tipCell = hover ? cells.find((c) => c.key === hover.key && c.day?.tooltip != null) : undefined;
  const flip = hover ? hover.x > window.innerWidth - 300 : false;
  // 1 Jan 2024 was a Monday.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }).replace(".", ""));

  return (
    <div className={`calendar ${loading ? "is-loading" : ""} ${className}`}>
      <div className="calendar__header">
        {showNavigation && (
          <IconButton label="Previous month" onClick={() => go(new Date(shown.getFullYear(), shown.getMonth() - 1, 1))}>
            <ChevronLeft size={16} />
          </IconButton>
        )}
        <span className="calendar__title">{shown.toLocaleDateString(locale, { month: "long", year: "numeric" })}</span>
        {showNavigation && (
          <IconButton label="Next month" onClick={() => go(new Date(shown.getFullYear(), shown.getMonth() + 1, 1))}>
            <ChevronRight size={16} />
          </IconButton>
        )}
      </div>

      <div className="calendar__weekdays">
        {weekdays.map((w) => (
          <div key={w} className="calendar__weekday">
            <span className="calendar__weekday-full">{w}</span>
            <span className="calendar__weekday-letter">{w.charAt(0)}</span>
          </div>
        ))}
      </div>

      <div className="calendar__grid" onMouseLeave={() => setHover(null)}>
        {cells.map(({ d, key, inMonth, day }) => {
          const background = day?.bands?.length ? bandsFill(day.bands, fill) : day?.color ? tint(day.color, fill) : null;
          const props = {
            className: `calendar__cell ${inMonth ? "" : "is-other-month"} ${key === todayKey ? "is-today" : ""} ${key === selected ? "is-selected" : ""}`,
            "data-filled": background ? "" : undefined,
            style: background ? ({ "--calendar-fill": background } as CSSProperties) : undefined,
            "aria-label": d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
            onMouseMove: (e: MouseEvent) => track(e, key),
          };
          const body = (
            <>
              <span className="calendar__day">{d.getDate()}</span>
              <span className="calendar__content">{day?.content}</span>
              <span className="calendar__badges">
                {day?.badges?.map((b, i) => (
                  <span key={i} title={b.label} aria-label={b.label} className="calendar__badge" style={{ "--calendar-badge": b.color } as CSSProperties} />
                ))}
              </span>
            </>
          );
          return onSelect ? (
            <button
              key={key}
              type="button"
              aria-pressed={key === selected}
              onClick={() => {
                onSelect(key);
                if (!inMonth) go(firstOfMonth(d));
              }}
              {...props}
            >
              {body}
            </button>
          ) : (
            <div key={key} {...props}>
              {body}
            </div>
          );
        })}
      </div>

      {hover &&
        tipCell &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[80] flex w-max min-w-40 max-w-[300px] flex-col gap-1.5 whitespace-nowrap rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-[13px] text-[var(--foreground)] shadow-lg"
            style={{ left: hover.x, top: hover.y, transform: `translate(${flip ? "calc(-100% - 14px)" : "14px"}, 14px)` }}
          >
            <Overline>{tipCell.d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })}</Overline>
            <div className="flex flex-col gap-1">{tipCell.day?.tooltip}</div>
          </div>,
          document.body,
        )}

      {!!legend?.length && (
        <ul className="calendar__legend">
          {legend.map((l) => (
            <li key={l.label} className="calendar__legend-item">
              <span
                className={l.kind === "dot" ? "calendar__legend-dot" : "calendar__legend-swatch"}
                style={l.kind === "dot" ? ({ "--calendar-badge": l.color } as CSSProperties) : { background: tint(l.color, fill) }}
              />
              <span className="calendar__legend-label">{l.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
