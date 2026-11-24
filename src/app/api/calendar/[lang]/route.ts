import { buildIcs } from "@/lib/wedding/calendar";
import { weddingCalendarEvent } from "@/lib/wedding/wedding-event";
import { LOCALES, isLocale } from "@/i18n/config";

export function generateStaticParams(): Array<{ lang: string }> {
  return LOCALES.map((lang) => ({ lang }));
}

/** Deterministic DTSTAMP keeps the response static (prerendered once at build). */
const PUBLISHED_AT = new Date("2026-11-01T00:00:00Z");

export async function GET(_request: Request, ctx: RouteContext<"/api/calendar/[lang]">): Promise<Response> {
  const { lang } = await ctx.params;
  if (!isLocale(lang)) return new Response("Not found", { status: 404 });

  return new Response(buildIcs(weddingCalendarEvent(lang), PUBLISHED_AT), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mariage.ics"',
    },
  });
}
