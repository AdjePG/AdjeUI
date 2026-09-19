"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { formatShortcut, useIsMac } from "./shortcuts";

// List of actions, usually inside a Popover. Lives in its own file since
// 13 Sep 2026 (it used to be glued to the Popover, and they are two different
// things: the Popover is a layer, the Menu is a list).

export type MenuAction = {
  key?: string;
  label: ReactNode;
  hint?: ReactNode; // secondary text under the label
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean; // marked with a check (current selection)
  danger?: boolean; // in red (sign out, delete)
  disabled?: boolean;
  // Key combination ("mod+d", "shift+delete"…). The menu only DRAWS it; to
  // make it actually work, hook it up with useShortcuts where the actions
  // live — a closed menu can't listen to anything.
  shortcut?: string;
};

// Divider line: separates groups of actions within the same menu (the usual
// one before a "Delete").
export type MenuSeparator = { separator: true; key?: string };

export type MenuItem = MenuAction | MenuSeparator;

function isSeparator(it: MenuItem): it is MenuSeparator {
  return (it as MenuSeparator).separator === true;
}

// `onPick` is called after the item's onClick: use it to close the popover.
export function Menu({ title, items, onPick }: { title?: ReactNode; items: MenuItem[]; onPick?: () => void }) {
  const mac = useIsMac();
  return (
    <div className="p-1">
      {title && (
        <span className="block px-2.5 pb-1 pt-1.5 text-[9.5px] font-semibold uppercase tracking-widest text-muted">{title}</span>
      )}
      {items.map((it, i) => {
        if (isSeparator(it)) {
          return <hr key={it.key ?? `sep-${i}`} className="my-1 border-0 border-t border-[var(--border)]" />;
        }
        return (
          <button
            key={it.key ?? i}
            type="button"
            disabled={it.disabled}
            onClick={() => {
              it.onClick?.();
              onPick?.();
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              it.active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
            } ${it.danger ? "text-[var(--negative)]" : ""}`}
          >
            {it.icon && <span className={`inline-flex shrink-0 ${it.danger ? "" : "text-muted"}`}>{it.icon}</span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{it.label}</span>
              {it.hint && <span className="block truncate text-[11px] text-muted">{it.hint}</span>}
            </span>
            {it.shortcut && (
              <kbd className="shrink-0 rounded border border-[var(--border)] px-1.5 py-0.5 font-sans text-[10.5px] leading-none text-muted">
                {formatShortcut(it.shortcut, mac)}
              </kbd>
            )}
            {it.active && <Check size={14} className="shrink-0 text-[var(--accent-blue)]" />}
          </button>
        );
      })}
    </div>
  );
}
