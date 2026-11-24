"use client";

import { useActionState, useSyncExternalStore, type ReactNode } from "react";
import { loginAction, type LoginState } from "@/server/actions/admin";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const INITIAL: LoginState = { error: false };

/** Read client-side: keeps the login page static (no searchParams → no Suspense needed). */
function useNextParam(): string {
  return useSyncExternalStore(
    () => () => undefined,
    () => new URLSearchParams(window.location.search).get("next") ?? "",
    () => "",
  );
}

export function LoginForm({ locale }: Readonly<{ locale: Locale }>): ReactNode {
  const [state, action, pending] = useActionState(loginAction, INITIAL);
  const next = useNextParam();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next} />
      <Field data-invalid={state.error}>
        <FieldLabel htmlFor="password">Mot de passe protocole</FieldLabel>
        <Input id="password" name="password" type="password" required autoComplete="current-password" aria-invalid={state.error} />
        {state.error && <FieldError>Mot de passe incorrect.</FieldError>}
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
