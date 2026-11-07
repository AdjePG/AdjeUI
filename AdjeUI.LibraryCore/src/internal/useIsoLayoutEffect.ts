"use client";

import { useEffect, useLayoutEffect } from "react";

// Layout effect on the client, plain effect on the server (where React warns
// about useLayoutEffect and there is nothing to measure anyway).
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
