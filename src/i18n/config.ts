/**
 * Locale primitives. Pure and dependency-free: imported by `proxy.ts` (runs before render)
 * and by server components alike.
 */

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return value !== undefined && value !== null && (LOCALES as readonly string[]).includes(value);
}

type WeightedTag = Readonly<{ tag: string; q: number }>;

function parseAcceptLanguage(header: string): WeightedTag[] {
  return header
    .split(",")
    .map((part): WeightedTag => {
      const [rawTag = "", ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: rawTag.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => b.q - a.q);
}

/**
 * Resolution order: explicit user choice (cookie) → device language → default.
 * `fr-CA`, `fr-BE`… all map to `fr`; anything that is neither fr nor en falls back to the default.
 */
export function resolveLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  if (!acceptLanguage) return DEFAULT_LOCALE;

  for (const { tag } of parseAcceptLanguage(acceptLanguage)) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}

export function pathnameHasLocale(pathname: string): boolean {
  return LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}
