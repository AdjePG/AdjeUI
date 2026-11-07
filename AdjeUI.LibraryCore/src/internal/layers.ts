"use client";

import { useEffect, type RefObject } from "react";
import { useLatest } from "./useLatest";

// Stack of open layers (dialogs, drawers, popovers, menus). Only the topmost
// one reacts to Escape, and a click inside a layer opened on top of another
// (a Select's list inside a Popover) does not count as "outside" the lower one.
type Layer = {
  escape: () => void;
  contains: (node: Node) => boolean;
};

const stack: Layer[] = [];

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.isComposing) return;
  stack[stack.length - 1]?.escape();
}

function push(layer: Layer) {
  if (stack.length === 0) document.addEventListener("keydown", onKeyDown);
  stack.push(layer);
}

function remove(layer: Layer) {
  const i = stack.indexOf(layer);
  if (i !== -1) stack.splice(i, 1);
  if (stack.length === 0) document.removeEventListener("keydown", onKeyDown);
}

function insideLayerAbove(layer: Layer, node: Node): boolean {
  for (let i = stack.indexOf(layer) + 1; i < stack.length; i++) {
    if (stack[i].contains(node)) return true;
  }
  return false;
}

type Refs = readonly RefObject<HTMLElement | null>[];

const NO_REFS: Refs = [];

function containedBy(refs: Refs, node: Node): boolean {
  return refs.some((r) => r.current?.contains(node));
}

/** Calls `onEscape` on Escape while `enabled`, only if this is the topmost open layer. */
export function useEscape(onEscape: () => void, enabled: boolean, refs: Refs = NO_REFS) {
  const latest = useLatest(onEscape);
  const latestRefs = useLatest(refs);
  useEffect(() => {
    if (!enabled) return;
    const layer: Layer = {
      escape: () => latest.current(),
      contains: (node) => containedBy(latestRefs.current, node),
    };
    push(layer);
    return () => remove(layer);
  }, [enabled, latest, latestRefs]);
}

/**
 * Closes a floating panel on Escape or on a mousedown outside `refs` (the
 * trigger and the panel), while `enabled`. Clicks inside layers opened on top
 * of this one are not "outside".
 */
export function useDismiss(refs: Refs, onDismiss: () => void, enabled: boolean) {
  const latest = useLatest(onDismiss);
  const latestRefs = useLatest(refs);
  useEffect(() => {
    if (!enabled) return;
    const layer: Layer = {
      escape: () => latest.current(),
      contains: (node) => containedBy(latestRefs.current, node),
    };
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (layer.contains(target) || insideLayerAbove(layer, target)) return;
      latest.current();
    }
    push(layer);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      remove(layer);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [enabled, latest, latestRefs]);
}
