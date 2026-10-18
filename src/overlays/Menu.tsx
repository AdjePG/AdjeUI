"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { formatShortcut, useIsMac } from "./shortcuts";
import { Overline } from "../primitives/Overline";

// List of actions, usually inside a Popover (the Popover is the layer, the
// Menu is the list).

export type MenuAction = {
  key?: string;
  label: ReactNode;
  /** Secondary text under the label. */
  hint?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  /** Marked with a check (current selection). */
  active?: boolean;
  /** In red (sign out, delete). */
  danger?: boolean;
  disabled?: boolean;
  /** The menu stays open after it: for a toggle whose new state shows on the item. */
  keepOpen?: boolean;
  /** Key combination ("mod+d"). The menu only draws it; `useShortcuts` where the actions live makes it work. */
  shortcut?: string;
};

// Divider line between groups of actions (the usual one before a "Delete").
export type MenuSeparator = { separator: true; key?: string };

export type MenuItem = MenuAction | MenuSeparator;

function isSeparator(it: MenuItem): it is MenuSeparator {
  return (it as MenuSeparator).separator === true;
}

// `onPick` is called after the item's onClick: use it to close the popover.
export function Menu({
  title,
  items,
  onPick,
}: {
  /** Overline over the items. */
  title?: ReactNode;
  items: MenuItem[];
  /** Called after an item's onClick (unless keepOpen): pass the Popover's close. */
  onPick?: () => void;
}) {
  const mac = useIsMac();
  return (
    // 4px between items: touching, two hovered/active rows merge into one block.
    <div role="menu" className="flex flex-col gap-1 p-1">
      {title && (
        <Overline as="div" className="px-2.5 pb-1 pt-1.5">
          {title}
        </Overline>
      )}
      {items.map((it, i) => {
        if (isSeparator(it)) {
          return <hr key={it.key ?? `sep-${i}`} role="separator" className="my-0.5 border-0 border-t border-[var(--border)]" />;
        }
        return (
          <button
            key={it.key ?? i}
            type="button"
            role="menuitem"
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
              {/* Under the label, not beside it: a second column would take the label's width. */}
              {it.shortcut && (
                <kbd className="mt-1 inline-block rounded border border-[var(--border)] px-1.5 py-0.5 font-sans text-[11px] leading-none text-muted">
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
