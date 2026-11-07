"use client";

import { useRef } from "react";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

// A ref that always holds the latest value: lets an effect or a global
// listener call the newest callback without re-subscribing on every render.
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
