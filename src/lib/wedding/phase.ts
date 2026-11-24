export type WeddingPhase = "before" | "day" | "after";

function calendarDay(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD, which compares lexicographically.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * "Wedding day" is the venue's calendar day, not the visitor's:
 * a guest abroad must still see the wedding-day animation on the right day.
 */
export function getWeddingPhase(now: Date, ceremonyAt: Date, timeZone: string): WeddingPhase {
  const today = calendarDay(now, timeZone);
  const weddingDay = calendarDay(ceremonyAt, timeZone);
  if (today < weddingDay) return "before";
  if (today === weddingDay) return "day";
  return "after";
}

export type Remaining = Readonly<{ days: number; hours: number; minutes: number; seconds: number }>;

export function getRemaining(now: Date, target: Date): Remaining | null {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}
