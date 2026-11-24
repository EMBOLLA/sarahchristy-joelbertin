"use client";

import { useActionState, type ReactNode } from "react";
import { importGuestsAction, type GuestImportState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "./ui";

const INITIAL: GuestImportState = { status: "idle" };

function Result({ state }: Readonly<{ state: GuestImportState }>): ReactNode {
  if (state.status === "idle") return null;
  if (state.errors.length > 0) {
    return (
      <ul role="alert" className="space-y-1 text-sm text-destructive">
        {state.errors.map((error) => (
          <li key={error.line}>
            Ligne {error.line} : {error.message}
          </li>
        ))}
        <li className="text-muted-foreground">Rien n&apos;a été importé : corrigez puis recommencez.</li>
      </ul>
    );
  }
  return (
    <p role="status" className="text-sm">
      {state.added} invité(s) ajouté(s)
      {state.rematched > 0 && ` · ${state.rematched} billet(s) existant(s) rattaché(s) automatiquement`}
    </p>
  );
}

export function AddGuestForm({ tableCount }: Readonly<{ tableCount: number }>): ReactNode {
  const [state, action, pending] = useActionState(importGuestsAction, INITIAL);

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="displayName">Nom et prénom</FieldLabel>
          <Input id="displayName" name="displayName" required minLength={2} />
        </Field>
        <Field>
          <FieldLabel htmlFor="partnerName">Partenaire (si couple)</FieldLabel>
          <Input id="partnerName" name="partnerName" />
        </Field>
        <Field>
          <FieldLabel htmlFor="ticketType">Type</FieldLabel>
          <NativeSelect id="ticketType" name="ticketType" defaultValue="">
            <option value="">Auto (selon partenaire)</option>
            <option value="solo">Solo</option>
            <option value="couple">Couple</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="tableNumber">Table</FieldLabel>
          <NativeSelect id="tableNumber" name="tableNumber" defaultValue="">
            <option value="">Plus tard</option>
            {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Table {n}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Result state={state} />
      <Button type="submit" disabled={pending}>
        Ajouter l&apos;invité
      </Button>
    </form>
  );
}

export function ImportGuestsForm(): ReactNode {
  const [state, action, pending] = useActionState(importGuestsAction, INITIAL);

  return (
    <form action={action} className="space-y-3">
      <Field>
        <FieldLabel htmlFor="csv">Coller depuis Excel / Google Sheets</FieldLabel>
        <Textarea id="csv" name="csv" rows={6} required placeholder={"Nom;Partenaire;Type;Table\nJean Mbeki;Marie Mbeki;couple;3\nPaul Ndong;;solo;"} />
        <FieldDescription>Une ligne par invité. Colonnes : nom, partenaire, type (solo/couple), table. Séparateur ; , ou tabulation.</FieldDescription>
      </Field>
      <Result state={state} />
      <Button type="submit" variant="outline" disabled={pending}>
        Importer
      </Button>
    </form>
  );
}
