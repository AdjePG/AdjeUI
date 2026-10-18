"use client";

import { useSyncExternalStore } from "react";

// One MediaQueryList and one "change" listener per query, however many
// components ask: subscribers share it.
type Entry = { mql: MediaQueryList; listeners: Set<() => void>; onChange: () => void };
const entries = new Map<string, Entry>();

function entryFor(query: string): Entry {
  let entry = entries.get(query);
  if (!entry) {
    const listeners = new Set<() => void>();
    entry = { mql: window.matchMedia(query), listeners, onChange: () => listeners.forEach((l) => l()) };
    entries.set(query, entry);
  }
  return entry;
}

/** Whether a media query matches. Always false on the server and during hydration. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (listener) => {
      const entry = entryFor(query);
      if (entry.listeners.size === 0) entry.mql.addEventListener("change", entry.onChange);
      entry.listeners.add(listener);
      return () => {
        entry.listeners.delete(listener);
        if (entry.listeners.size === 0) entry.mql.removeEventListener("change", entry.onChange);
      };
    },
    () => entryFor(query).mql.matches,
    () => false,
  );
}
