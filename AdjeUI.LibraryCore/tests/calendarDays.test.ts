// Calendar's arithmetic. Run: npm test (node --test, no dependencies).
import { test } from "node:test";
import assert from "node:assert/strict";
import { bandsFill, calendarKey, firstOfMonth, monthGrid, tint } from "../src/data/calendarDays.ts";

test("calendarKey: a local day, zero-padded", () => {
  assert.equal(calendarKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(calendarKey(new Date(2026, 10, 30, 23, 59)), "2026-11-30");
});

test("firstOfMonth: the 1st of the same month", () => {
  assert.equal(calendarKey(firstOfMonth(new Date(2026, 10, 19))), "2026-11-01");
});

test("monthGrid: six weeks from the Monday on or before the 1st", () => {
  const nov = monthGrid(new Date(2026, 10, 7));
  assert.equal(nov.length, 42);
  assert.equal(calendarKey(nov[0]), "2026-10-26");
  assert.equal(nov[0].getDay(), 1);
  assert.equal(calendarKey(nov[41]), "2026-12-06");
  // A month that starts on a Monday starts on its 1st.
  assert.equal(calendarKey(monthGrid(new Date(2026, 5, 15))[0]), "2026-06-01");
});

test("tint: a colour at fill %, transparent as it is", () => {
  assert.equal(tint("red", 50), "color-mix(in srgb, transparent, red 50%)");
  assert.equal(tint("transparent", 50), "transparent");
});

test("bandsFill: sized bands take their share, the rest share what is left", () => {
  assert.equal(bandsFill([{ color: "a" }, { color: "b", percent: 30 }], 50), `linear-gradient(to bottom, ${tint("a", 50)} 0.00% 70.00%, ${tint("b", 50)} 70.00% 100.00%)`);
  assert.equal(bandsFill([{ color: "a" }, { color: "b" }], 50), `linear-gradient(to bottom, ${tint("a", 50)} 0.00% 50.00%, ${tint("b", 50)} 50.00% 100.00%)`);
});

test("bandsFill: past 100 % the sized bands are scaled down", () => {
  assert.equal(bandsFill([{ color: "a", percent: 150 }, { color: "b", percent: 50 }], 40), `linear-gradient(to bottom, ${tint("a", 40)} 0.00% 75.00%, ${tint("b", 40)} 75.00% 100.00%)`);
});
