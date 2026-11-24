"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { getRemaining, type Remaining } from "@/lib/wedding/phase";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";

type CountdownProps = Readonly<{
  targetIso: string;
  locale: Locale;
  labels: Dictionary["countdown"];
}>;

function subscribeEverySecond(onTick: () => void): () => void {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}

// Snapshot is a primitive (seconds) so useSyncExternalStore can compare it cheaply.
const getNowSeconds = (): number => Math.floor(Date.now() / 1000);
const getServerSnapshot = (): null => null;

const UNITS = ["days", "hours", "minutes", "seconds"] as const satisfies ReadonlyArray<keyof Remaining>;

export function Countdown({ targetIso, locale, labels }: CountdownProps): ReactNode {
  // null on the server and during hydration → no mismatch, the static shell shows placeholders.
  const nowSeconds = useSyncExternalStore(subscribeEverySecond, getNowSeconds, getServerSnapshot);
  const plural = new Intl.PluralRules(locale);

  const remaining = nowSeconds === null ? null : getRemaining(new Date(nowSeconds * 1000), new Date(targetIso));

  if (nowSeconds !== null && remaining === null) {
    return <p className="text-center font-heading text-2xl">{labels.past}</p>;
  }

  return (
    <dl className="grid grid-cols-4 gap-3 text-center" aria-live="off">
      {UNITS.map((unit) => {
        const value = remaining?.[unit];
        const form = plural.select(value ?? 0) === "one" ? "one" : "other";
        return (
          <div key={unit} className="rounded-xl border bg-card px-2 py-4">
            <dd className="font-heading text-3xl tabular-nums">{value ?? "–"}</dd>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{labels.units[unit][form]}</dt>
          </div>
        );
      })}
    </dl>
  );
}
