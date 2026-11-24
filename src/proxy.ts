import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, pathnameHasLocale, resolveLocale } from "@/i18n/config";

/**
 * Locale negotiation without visible prefix: `/` is *rewritten* (not redirected) to `/fr` or `/en`
 * based on the cookie, then the device language. Guests share a clean URL; both locales stay
 * statically prerendered. `/fr` and `/en` remain directly reachable.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  if (pathnameHasLocale(pathname)) return NextResponse.next();

  const locale = resolveLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get("accept-language"),
  );

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (public assets, video, fonts…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
