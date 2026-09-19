"use client";

import { useEffect, useRef, useState } from "react";

// Keyboard shortcuts (13 Sep 2026). They live here because they were born for
// Menu items, but they are NOT a Popover concern: the popover only exists
// while it's open, and a shortcut has to work with the menu closed. That's why
// the Menu only DRAWS the shortcut, and whoever owns the actions HOOKS them
// with useShortcuts — usually the same screen that builds the items.
//
//   const items = [{ label: "Duplicate", shortcut: "mod+d", onClick: duplicate }];
//   useShortcuts(items);            // works whether the menu is open or not
//   <Popover …><Menu items={items} /></Popover>
//
// Syntax: parts separated by "+", in any order.
//   mod    → ⌘ on Mac, Ctrl elsewhere (the one you want 90% of the time)
//   ctrl · shift · alt
//   the key: a letter, a digit or a name (enter, delete, escape, arrowup…)

export type Combo = {
  key: string;
  mod: boolean;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
};

export function parseShortcut(shortcut: string): Combo {
  const combo: Combo = { key: "", mod: false, ctrl: false, shift: false, alt: false };
  for (const part of shortcut.toLowerCase().split("+")) {
    const p = part.trim();
    if (!p) continue;
    if (p === "mod" || p === "cmd" || p === "meta" || p === "command") combo.mod = true;
    else if (p === "ctrl" || p === "control") combo.ctrl = true;
    else if (p === "shift") combo.shift = true;
    else if (p === "alt" || p === "option" || p === "opt") combo.alt = true;
    else combo.key = p;
  }
  return combo;
}

export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /mac|iphone|ipad|ipod/i.test(navigator.userAgent);
}

// SSR-safe Mac detection: on the first render it always says "no", and it
// corrects itself on mount. Without this, the server HTML and the client HTML
// don't match and React complains.
export function useIsMac(): boolean {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(isMac()), []);
  return mac;
}

const MAC_NAMES: Record<string, string> = {
  mod: "⌘",
  ctrl: "⌃",
  shift: "⇧",
  alt: "⌥",
  enter: "↵",
  delete: "⌫",
  backspace: "⌫",
  escape: "Esc",
  esc: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

const NAMES: Record<string, string> = {
  mod: "Ctrl",
  ctrl: "Ctrl",
  shift: "Shift",
  alt: "Alt",
  enter: "Enter",
  delete: "Del",
  backspace: "Backspace",
  escape: "Esc",
  esc: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
};

// "mod+shift+d" → "⌘⇧D" on Mac, "Ctrl+Shift+D" elsewhere.
export function formatShortcut(shortcut: string, mac = isMac()): string {
  const table = mac ? MAC_NAMES : NAMES;
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => table[p] ?? (p.length === 1 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1)));
  return parts.join(mac ? "" : "+");
}

function matches(e: KeyboardEvent, c: Combo, mac: boolean): boolean {
  if (!c.key) return false;
  const key = e.key.toLowerCase();
  if (key !== c.key && !(c.key.length === 1 && e.code.toLowerCase() === `key${c.key}`)) return false;
  // "mod" is ⌘ on Mac and Ctrl elsewhere; if explicit ctrl was also requested, it's required.
  const modOk = c.mod ? (mac ? e.metaKey : e.ctrlKey) : mac ? !e.metaKey : true;
  const ctrlOk = c.ctrl ? e.ctrlKey : c.mod && !mac ? true : !e.ctrlKey;
  return modOk && ctrlOk && e.shiftKey === c.shift && e.altKey === c.alt;
}

// Is the focus somewhere you type? There, modifier-less shortcuts get in the
// way (typing "d" must not delete anything).
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

export type ShortcutAction = {
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  // So a Menu's item list can be passed as is, separators included: they are
  // ignored (they have no shortcut to hook).
  separator?: boolean;
};

// Hooks the shortcuts of a list of actions while the component is mounted.
// Items without `shortcut` are ignored, so you can pass a menu's MenuItems
// directly, separators included.
//
// The list is usually built on every render (lessonMenu(active), for
// example), so the listener is NOT re-hooked because of that: only when the
// shortcuts change. The actions are read from a ref, always the latest ones.
export function useShortcuts(actions: readonly ShortcutAction[], options?: { enabled?: boolean }) {
  const active = options?.enabled ?? true;
  const signature = actions.map((a) => a.shortcut ?? "").join("|");
  const ref = useRef(actions);
  ref.current = actions;

  useEffect(() => {
    if (!active || !signature.replace(/\|/g, "")) return;
    const mac = isMac();

    function onKey(e: KeyboardEvent) {
      for (const action of ref.current) {
        if (!action.shortcut) continue;
        const combo = parseShortcut(action.shortcut);
        const noModifier = !combo.mod && !combo.ctrl && !combo.alt;
        if (noModifier && isTyping(e.target)) continue;
        if (!matches(e, combo, mac)) continue;
        if (action.disabled) return;
        e.preventDefault();
        action.onClick?.();
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, signature]);
}
