"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { getWeddingPhase } from "@/lib/wedding/phase";
import { useNow } from "@/hooks/use-now";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const PALETTE = ["#A8532F", "#C26A44", "#BE9A45", "#E2C77A", "#FAF6F0"];
const SESSION_KEY = "wedding:celebrated";

type WeddingDayProps = Readonly<{ ceremonyIso: string; timeZone: string; banner: string }>;

/** `?preview=day` forces the animation — lets the protocol rehearse before the date. */
function usePreviewFlag(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get("preview") === "day",
    () => false,
  );
}

function alreadyCelebrated(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markCelebrated(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore
  }
}

async function celebrate(): Promise<void> {
  // Loaded only on the wedding day: zero cost for every other visit.
  const { default: confetti } = await import("canvas-confetti");
  const end = Date.now() + 2500;
  const frame = (): void => {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: PALETTE, disableForReducedMotion: true });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: PALETTE, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function WeddingDay({ ceremonyIso, timeZone, banner }: WeddingDayProps): ReactNode {
  const now = useNow(60_000);
  const preview = usePreviewFlag();
  const reducedMotion = usePrefersReducedMotion();
  const isDay = preview || (now !== null && getWeddingPhase(now, new Date(ceremonyIso), timeZone) === "day");

  useEffect(() => {
    if (!isDay || reducedMotion || alreadyCelebrated()) return;
    markCelebrated();
    void celebrate();
  }, [isDay, reducedMotion]);

  if (!isDay) return null;

  return (
    <div role="status" className="sticky top-0 z-40 border-b border-gold bg-primary px-4 py-2 text-center text-primary-foreground">
      <p className="font-script text-2xl">{banner}</p>
    </div>
  );
}
