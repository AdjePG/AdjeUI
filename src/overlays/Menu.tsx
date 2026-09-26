"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { formatShortcut, useIsMac } from "./shortcuts";
import { Overline } from "../primitives/Overline";

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
  // The menu stays open after it (26 Sep 2026): for a toggle such as a theme
  // switch, whose new state is shown right there on the item — closing on it
  // hid the very change you had just made.
  keepOpen?: boolean;
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
    // 4px between items (26 Sep 2026): touching, two hovered/active rows
    // merged into one block.
    <div className="flex flex-col gap-1 p-1">
      {title && (
        <Overline as="div" className="px-2.5 pb-1 pt-1.5">
          {title}
        </Overline>
      )}
      {items.map((it, i) => {
        if (isSeparator(it)) {
          return <hr key={it.key ?? `sep-${i}`} className="my-0.5 border-0 border-t border-[var(--border)]" />;
        }
        return (
          <button
            key={it.key ?? i}
            type="button"
            disabled={it.disabled}
            onClick={() => {
              it.onClick?.();
              if (!it.keepOpen) onPick?.();
            }}
            className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              it.active ? "bg-[var(--hover)]" : "hover:bg-[var(--hover)]"
            } ${it.danger ? "text-[var(--negative)]" : ""}`}
          >
            {it.icon && <span className={`inline-flex shrink-0 pt-0.5 ${it.danger ? "" : "text-muted"}`}>{it.icon}</span>}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{it.label}</span>
              {it.hint && <span className="block truncate text-[11px] text-muted">{it.hint}</span>}
              {/* The key combination goes UNDER the label, not to its right
                  (20 Sep 2026). On the right it was a second column competing
                  for the same width, and the label — the part you actually read
                  — was the one that lost: "Duplicate les…" next to a pristine
                  "Ctrl+Shift+D". Underneath, the label gets the whole row and
                  the shortcut is still there for whoever looks for it. */}
              {it.shortcut && (
                <kbd className="mt-1 inline-block rounded border border-[var(--border)] px-1.5 py-0.5 font-sans text-[10.5px] leading-none text-muted">
                  {formatShortcut(it.shortcut, mac)}
                </kbd>
              )}
            </span>
            {it.active && <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent-blue)]" />}
          </button>
        );
      })}
    </div>
  );
}
