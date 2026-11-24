"use client";

import { useActionState, type ReactNode } from "react";
import { saveFaqAction, type FaqFormState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type FaqFormValues = Readonly<{
  questionFr: string;
  answerFr: string;
  questionEn: string;
  answerEn: string;
  position: number;
  published: boolean;
}>;

const EMPTY: FaqFormValues = { questionFr: "", answerFr: "", questionEn: "", answerEn: "", position: 0, published: true };
const INITIAL: FaqFormState = { status: "idle" };

type FaqFormProps = Readonly<{ faqId: string | null; values?: FaqFormValues }>;

export function FaqForm({ faqId, values = EMPTY }: FaqFormProps): ReactNode {
  const [state, action, pending] = useActionState(saveFaqAction, INITIAL);
  const prefix = faqId ?? "new";

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="faqId" value={faqId ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${prefix}-qfr`}>Question (FR)</FieldLabel>
          <Input id={`${prefix}-qfr`} name="questionFr" required minLength={3} defaultValue={values.questionFr} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-qen`}>Question (EN)</FieldLabel>
          <Input id={`${prefix}-qen`} name="questionEn" required minLength={3} defaultValue={values.questionEn} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-afr`}>Réponse (FR)</FieldLabel>
          <Textarea id={`${prefix}-afr`} name="answerFr" required rows={3} defaultValue={values.answerFr} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${prefix}-aen`}>Réponse (EN)</FieldLabel>
          <Textarea id={`${prefix}-aen`} name="answerEn" required rows={3} defaultValue={values.answerEn} />
        </Field>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <Field className="w-24">
          <FieldLabel htmlFor={`${prefix}-pos`}>Ordre</FieldLabel>
          <Input id={`${prefix}-pos`} name="position" type="number" min={0} max={999} defaultValue={values.position} />
        </Field>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={values.published} className="size-4 accent-primary" />
          Publiée
        </label>
        <Button type="submit" disabled={pending}>
          {faqId === null ? "Ajouter" : "Enregistrer"}
        </Button>
        {state.status === "saved" && <span role="status" className="pb-2 text-sm">Enregistré ✓</span>}
        {state.status === "invalid" && <span role="alert" className="pb-2 text-sm text-destructive">Champs invalides</span>}
      </div>
    </form>
  );
}
