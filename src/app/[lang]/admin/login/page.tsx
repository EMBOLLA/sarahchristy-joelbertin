import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/i18n/get-dictionary";
import { LoginForm } from "@/components/admin/login-form";
import { Ornament, ScriptHeading } from "@/components/typography";

export const metadata: Metadata = { title: "Back-office — Connexion" };

/** Static page: the form posts to a Server Action, no session read here. */
export default async function AdminLoginPage(): Promise<ReactNode> {
  const locale = await getLocale();

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-8 px-5">
      <div className="space-y-3 text-center">
        <ScriptHeading as="h1" className="text-5xl">
          Protocole
        </ScriptHeading>
        <Ornament />
      </div>
      <LoginForm locale={locale} />
    </main>
  );
}
