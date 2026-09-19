"use client";

import React from "react";
import { Menu } from "lucide-react";
import { IconChip } from "../primitives/IconChip";
import { Tabs } from "../controls/Tabs";
import { sideNavState, useSideNavState } from "./sideNavState";

// The SINGLE page header, shared by every page of both apps.
//   row 1:  [☰ mobile only, if there's a SideNav] [chip + title] ..... [actions]
//   row 2:  [ sub-tabs ]  <- ONLY if there are any, FLUSH with the bottom
//           edge of the header: the active tab's underline sits right on the
//           border line (browser/YouTube style).
export function PageHeader({
  icon,
  title,
  actions,
  tabs,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; icon?: React.ReactNode }[];
  };
}) {
  const { mounted } = useSideNavState();
  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto w-full">
        {/* Title + actions row. No bottom padding when there are tabs so they
            sit flush with the edge. */}
        <div className={`flex items-center gap-3 pt-3 ${tabs ? "pb-0" : "pb-3"}`}>
          {mounted > 0 && (
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
        {tabs && (
          <Tabs value={tabs.value} onChange={tabs.onChange} options={tabs.options} className="-ml-3 mt-1" />
        )}
      </div>
    </header>
  );
}
