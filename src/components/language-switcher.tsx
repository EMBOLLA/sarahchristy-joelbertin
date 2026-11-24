"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { buttonVariants } from "@/components/ui/button";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type LanguageSwitcherProps = Readonly<{ target: Locale; label: string }>;

/** Persists the explicit choice: it then wins over the device language in `proxy.ts`. */
export function LanguageSwitcher({ target, label }: LanguageSwitcherProps): ReactNode {
  const persistChoice = (): void => {
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  };

  return (
    <Link
      href={`/${target}`}
      hrefLang={target}
      onClick={persistChoice}
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      {label}
    </Link>
  );
}
