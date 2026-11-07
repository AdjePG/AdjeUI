import { useState } from "react";
import { Package, Pencil, Trash2, Wallet } from "lucide-react";
import { Calendar, CalendarTipRow, Card, IconButton, Pagination, Pill, ProgressBar, Stat, Table, calendarKey, palette, type CalendarDay } from "../../src";
import { Block, Section } from "../common";

// ---------------- data ----------------

// A month of the calendar demo around today: colours, bands, lines, badges, tooltips and a closed day.
function sampleDays(): CalendarDay[] {
  const now = new Date();
  const day = (d: number) => calendarKey(new Date(now.getFullYear(), now.getMonth(), d));
  const free = palette("blue", 500);
  const full = palette("red", 500);
  const holiday = { color: palette("orange", 600), label: "Holiday" };
  const upkeep = { color: palette("purple", 500), label: "Maintenance" };
  // Whatever the app puts in the middle: one figure, or two short lines.
  const lines = (top: string, bottom: string) => (
    <span className="flex flex-col">
      <b>{top}</b>
      <span className="text-xs text-muted">{bottom}</span>
    </span>
  );
  return [
    { date: day(2), content: lines("8 h", "2 shifts"), color: free, tooltip: (<><CalendarTipRow color={free} icon={<Package size={14} />} label="Morning shift" detail="Ana, Luis" value="08:00" /><CalendarTipRow color={free} icon={<Package size={14} />} label="Evening shift" detail="Marta" value="16:00" /></>) },
    { date: day(3), content: lines("6 h", "1 shift"), color: free },
    { date: day(4), content: <b>4 h</b>, badges: [upkeep], tooltip: <CalendarTipRow color={upkeep.color} label="Maintenance" value="2 h" /> },
    { date: day(8), content: <span className="text-xs text-muted">Closed</span>, color: full, badges: [holiday] },
    { date: day(12), content: <b>2 h</b>, bands: [{ color: free }, { color: full, percent: 30 }], tooltip: <CalendarTipRow color={full} label="Booked" value="30%" /> },
    {
      date: day(15),
      content: <b>7 h</b>,
      color: palette("amber", 400),
      badges: [upkeep, holiday],
      // Any component goes in a tooltip: here a title, a bar and a line.
      tooltip: (
        <div className="flex w-52 flex-col gap-1.5">
          <span className="font-semibold">Capacity</span>
          <ProgressBar value={7} max={8} />
          <span className="text-xs text-muted">7 of 8 hours booked · maintenance and a holiday</span>
        </div>
      ),
    },
    { date: day(22), content: lines("8 h", "2 shifts"), color: palette("teal", 600) },
  ];
}

export function DataSection() {
  const [page, setPage] = useState(1);
  const [day, setDay] = useState<string | null>(null);
  return (
    <Section id="data" title="Data" subtitle="src/data — indicators, table, progress and pagination">
      <Card className="flex flex-col gap-4">
        <Block name="Stat: tone (neutral, positive, negative, accent) + icon / hint / help">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <Stat label="Products" value={57} icon={<Package size={14} />} />
            <Stat label="Published" value={12} tone="positive" hint="2 paused" />
            <Stat label="Average margin" value="44%" tone="accent" help={<p>Profit / sale price.</p>} />
            <Stat label="Losses" value={2} tone="negative" icon={<Wallet size={14} />} hint="This month" />
          </div>
        </Block>
        <Block name="Table (horizontal scroll if it does not fit; th/td without classes; wrapperClassName on the scroll box)">
          <div className="w-full">
            <Table minWidth={520} wrapperClassName="rounded-xl border border-[var(--border)] px-2">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th className="!text-right">Price</th>
                  <th className="!text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2D Smiley</td>
                  <td><Pill color={palette("green", 600)}>Published</Pill></td>
                  <td className="text-muted">graphic tee, funny</td>
                  <td className="text-right font-semibold">$24.99</td>
                  <td className="text-right">
                    <IconButton label="Edit" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Delete" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
                <tr>
                  <td>Vespa Mug</td>
                  <td><Pill>Idea</Pill></td>
                  <td className="text-muted">vespa, retro</td>
                  <td className="text-right font-semibold">$14.99</td>
                  <td className="text-right">
                    <IconButton label="Edit" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Delete" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
                <tr>
                  <td>Poster Kharis</td>
                  <td><Pill color={palette("amber", 600)}>Pending</Pill></td>
                  <td className="text-muted">wall art</td>
                  <td className="text-right font-semibold">$19.99</td>
                  <td className="text-right">
                    <IconButton label="Edit" size="sm" onClick={() => {}}><Pencil size={13} /></IconButton>
                    <IconButton label="Delete" size="sm" tone="danger" onClick={() => {}}><Trash2 size={13} /></IconButton>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Block>
        <Block name="ProgressBar: tone (accent, positive, negative) + max">
          <div className="w-full flex flex-col gap-2">
            <ProgressBar value={72} />
            <ProgressBar value={100} tone="positive" />
            <ProgressBar value={31} tone="negative" />
            <div className="flex items-center gap-2">
              <div className="flex-1"><ProgressBar value={3} max={8} /></div>
              <span className="text-[12px] text-muted shrink-0">3 of 8 (max)</span>
            </div>
          </div>
        </Block>
        <Block name="Calendar: days (content in the middle, color or bands, badges along the bottom, tooltip), selected + onSelect, legend (swatch / dot), fill, loading, showNavigation">
          <div className="w-full max-w-3xl">
            <Calendar
              days={sampleDays()}
              selected={day}
              onSelect={setDay}
              legend={[
                { label: "Available", color: palette("blue", 500) },
                { label: "Fully booked", color: palette("red", 500) },
                { label: "Holiday", color: palette("orange", 600), kind: "dot" },
                { label: "Maintenance", color: palette("purple", 500), kind: "dot" },
              ]}
            />
            <p className="mt-2 text-[12px] text-muted">onSelect: {day ?? "—"}</p>
          </div>
        </Block>
        <Block name="Pagination (page, pageCount, total, noun)">
          <div className="w-full">
            <Pagination page={page} pageCount={5} total={102} onPage={setPage} noun="products" />
          </div>
        </Block>
      </Card>
    </Section>
  );
}
