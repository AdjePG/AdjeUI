"use client";

import { ReactNode } from "react";
import { Menu } from "lucide-react";
import { IconChip } from "../primitives/IconChip";
import { Tabs } from "../controls/Tabs";
import type { SegmentedOption } from "../controls/Segmented";
import { sideNavState, useSideNavSelector } from "./sideNavState";

// The SINGLE page header, shared by every page:
//   row 1:  [☰ mobile only, if there's a SideNav] [chip + title] ..... [actions]
//   row 2:  [ sub-tabs ]  <- only if there are any, flush with the bottom
//           edge, so the active tab's underline sits on the border line.
export function PageHeader<T extends string = string>({
  icon,
  title,
  actions,
  tabs,
  menu = true,
}: {
  icon: ReactNode;
  title: ReactNode;
  /** Normally a Toolbar. */
  actions?: ReactNode;
  tabs?: {
    value: T;
    onChange: (v: T) => void;
    options: (SegmentedOption<T> & { label: string })[];
  };
  /** false = no ☰ on mobile even with a SideNav mounted: for a screen laid
   *  over the app (a full-screen preview), where there is no menu to open. */
  menu?: boolean;
}) {
  const hasNav = useSideNavSelector((s) => s.mounted > 0);
  return (
    // The padding goes inside the max-width box, the way every page lays its
    // content out, so the title shares the content's left edge; the border
    // and background stay on the full-width <header>.
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6">
        <div className={`flex items-center gap-3 pt-3 ${tabs ? "pb-0" : "pb-3"}`}>
          {menu && hasNav && (
            <button
              type="button"
              onClick={() => sideNavState.open()}
              aria-label="Open menu"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 -ml-1 rounded-lg hover:bg-[var(--hover)] shrink-0"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 shrink-0">
            <IconChip size="lg">{icon}</IconChip>
            {title}
          </h1>
          {actions && <div className="flex-1 min-w-0 flex justify-end">{actions}</div>}
        </div>
        {tabs && <Tabs value={tabs.value} onChange={tabs.onChange} options={tabs.options} className="-ml-3 mt-1" />}
      </div>
    </header>
  );
}
