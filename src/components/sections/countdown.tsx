"use client";

import type { ReactNode } from "react";
import { getRemaining, getWeddingPhase, type Remaining } from "@/lib/wedding/phase";
import { useNow } from "@/hooks/use-now";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";

type CountdownProps = Readonly<{
  targetIso: string;
  timeZone: string;
  locale: Locale;
  labels: Dictionary["countdown"];
}>;

const UNITS = ["days", "hours", "minutes", "seconds"] as const satisfies ReadonlyArray<keyof Remaining>;

export function Countdown({ targetIso, timeZone, locale, labels }: CountdownProps): ReactNode {
  const now = useNow(1000);
  const target = new Date(targetIso);
  const remaining = now === null ? null : getRemaining(now, target);

  if (now !== null && remaining === null) {
    const message = getWeddingPhase(now, target, timeZone) === "day" ? labels.today : labels.past;
    return <p className="text-center font-script text-4xl text-primary">{message}</p>;
  }

  const plural = new Intl.PluralRules(locale);
  return (
    <dl className="grid grid-cols-4 gap-2 text-center">
      {UNITS.map((unit) => {
        const value = remaining?.[unit];
        const form = plural.select(value ?? 0) === "one" ? "one" : "other";
        return (
          <div key={unit} className="flex flex-col-reverse border border-gold/60 bg-card px-1 py-4">
            <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{labels.units[unit][form]}</dt>
            <dd className="font-heading text-4xl tabular-nums text-primary">{value ?? "–"}</dd>
          </div>
        );
      })}
    </dl>
  );
}
