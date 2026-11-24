"use client";

import type { ReactNode } from "react";
import { useNow } from "@/hooks/use-now";
import { getWeddingPhase } from "@/lib/wedding/phase";
import { cn } from "@/lib/utils";

export type ScheduleItemView = Readonly<{
  id: string;
  at: string;
  /** Pre-formatted on the server in the venue's timezone. */
  time: string;
  title: string;
  description: string;
  venue: string;
}>;

type ScheduleProps = Readonly<{
  items: ReadonlyArray<ScheduleItemView>;
  timeZone: string;
  nowLabel: string;
}>;

function currentStepId(items: ReadonlyArray<ScheduleItemView>, now: Date): string | null {
  let current: string | null = null;
  for (const item of items) {
    if (now >= new Date(item.at)) current = item.id;
  }
  return current;
}

/** On the wedding day, the step in progress is highlighted. */
export function Schedule({ items, timeZone, nowLabel }: ScheduleProps): ReactNode {
  const now = useNow(60_000);
  const first = items[0];
  const isWeddingDay = now !== null && first !== undefined && getWeddingPhase(now, new Date(first.at), timeZone) === "day";
  const currentId = isWeddingDay ? currentStepId(items, now) : null;

  return (
    <ol className="relative space-y-6 border-l border-gold/60 pl-6">
      {items.map((item) => {
        const isCurrent = item.id === currentId;
        return (
          <li key={item.id} className="relative" aria-current={isCurrent ? "step" : undefined}>
            <span
              aria-hidden
              className={cn(
                "absolute top-2 -left-[29px] size-2.5 rotate-45 border border-gold bg-background",
                isCurrent && "bg-gold",
              )}
            />
            <p className="text-sm tracking-[0.15em] text-muted-foreground uppercase">
              {item.time} · {item.venue}
            </p>
            <h3 className={cn("font-script text-3xl text-primary", isCurrent && "text-gold")}>{item.title}</h3>
            <p className="text-muted-foreground">{item.description}</p>
            {isCurrent && <p className="mt-1 text-xs font-semibold tracking-wide text-gold uppercase">{nowLabel}</p>}
          </li>
        );
      })}
    </ol>
  );
}
