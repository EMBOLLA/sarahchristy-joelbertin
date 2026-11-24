import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { DownloadIcon, LogOutIcon } from "lucide-react";
import { getLocale } from "@/i18n/get-dictionary";
import { logoutAction } from "@/server/actions/admin";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScriptHeading } from "@/components/typography";

export const metadata: Metadata = { title: "Back-office protocole" };

/**
 * Static chrome only. The session is checked by each page inside its <Suspense>
 * boundary (Cache Components forbids cookie reads in the static shell) AND by each action.
 */
export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">): Promise<ReactNode> {
  const locale = await getLocale();
  const base = `/${locale}/admin`;
  const links = [
    { href: base, label: "Billets" },
    { href: `${base}/guests`, label: "Invités & tables" },
    { href: `${base}/faq`, label: "FAQ" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16">
      <header className="flex items-center justify-between gap-2 border-b border-gold/60 py-4">
        <ScriptHeading as="h1" className="text-4xl">
          Protocole
        </ScriptHeading>
        <div className="flex gap-1">
          <a href="/api/admin/export" download className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <DownloadIcon aria-hidden /> CSV
          </a>
          <form action={logoutAction}>
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="ghost" size="sm" aria-label="Déconnexion">
              <LogOutIcon aria-hidden />
            </Button>
          </form>
        </div>
      </header>
      <nav className="flex gap-1 overflow-x-auto py-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
