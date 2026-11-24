import { LOCALES } from "@/i18n/config";

const ALLOWED = new RegExp(`^/(${LOCALES.join("|")})/(admin|check)(/[A-Za-z0-9_-]+)*$`);

/**
 * Post-login redirect target. Only internal admin/check paths are accepted:
 * anything else (absolute URL, `//evil.com`, `/\\evil.com`) falls back — no open redirect.
 */
export function safeNextPath(candidate: string | null | undefined, fallback: string): string {
  return typeof candidate === "string" && ALLOWED.test(candidate) ? candidate : fallback;
}
