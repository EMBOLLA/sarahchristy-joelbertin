"use client";

import { useSyncExternalStore } from "react";

function subscribeEvery(intervalMs: number): (onTick: () => void) => () => void {
  return (onTick) => {
    const id = window.setInterval(onTick, intervalMs);
    return () => window.clearInterval(id);
  };
}

const subscribers = new Map<number, (onTick: () => void) => () => void>();

/**
 * Current time, quantised to `intervalMs` so the snapshot is a stable primitive.
 * `null` during SSR/hydration: time-dependent UI never causes a hydration mismatch.
 */
export function useNow(intervalMs: number): Date | null {
  let subscribe = subscribers.get(intervalMs);
  if (!subscribe) {
    subscribe = subscribeEvery(intervalMs);
    subscribers.set(intervalMs, subscribe);
  }
  const tick = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs),
    () => null,
  );
  return tick === null ? null : new Date(tick * intervalMs);
}
