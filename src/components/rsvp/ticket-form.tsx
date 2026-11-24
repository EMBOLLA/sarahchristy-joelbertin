"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { DownloadIcon, TicketIcon } from "lucide-react";
import { submitTicketRequest, type TicketFormState } from "@/server/actions/ticket";
import { NAME_MAX_LENGTH, TICKET_TYPES, type TicketType } from "@/lib/wedding/ticket-request";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Gold } from "@/components/typography";
import { cn } from "@/lib/utils";
import { rememberTicket, ticketPdfUrl, useRememberedTicket } from "./remembered-ticket";

type Labels = Dictionary["rsvp"];
type TicketFormProps = Readonly<{ locale: Locale; labels: Labels }>;

const INITIAL_STATE: TicketFormState = { status: "idle" };

function DownloadLink({ publicCode, label }: Readonly<{ publicCode: string; label: string }>): ReactNode {
  return (
    <a href={ticketPdfUrl(publicCode)} download className={cn(buttonVariants({ size: "lg" }), "w-full")}>
      <DownloadIcon aria-hidden />
      {label}
    </a>
  );
}

function NamesLine({ names }: Readonly<{ names: ReadonlyArray<string> }>): ReactNode {
  return (
    <p className="font-script text-3xl text-primary">
      {names.map((name, index) => (
        <span key={name}>
          {index > 0 && <Gold> & </Gold>}
          {name}
        </span>
      ))}
    </p>
  );
}

function TicketTypeChoice({
  value,
  onChange,
  labels,
}: Readonly<{ value: TicketType; onChange: (type: TicketType) => void; labels: Labels["type"] }>): ReactNode {
  return (
    <FieldSet>
      <FieldLegend>{labels.legend}</FieldLegend>
      <div className="grid grid-cols-2 gap-3">
        {TICKET_TYPES.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer flex-col items-center gap-1 border bg-card p-4 text-center transition-colors has-checked:border-primary has-checked:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring"
          >
            <input
              type="radio"
              name="ticketType"
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
              className="sr-only"
            />
            <span className="font-script text-2xl text-primary">{labels[type]}</span>
            <span className="text-sm text-muted-foreground">{type === "solo" ? labels.soloHint : labels.coupleHint}</span>
          </label>
        ))}
      </div>
    </FieldSet>
  );
}

function TicketFormInner({ locale, labels, onReset }: TicketFormProps & Readonly<{ onReset: () => void }>): ReactNode {
  const [state, formAction, pending] = useActionState(submitTicketRequest, INITIAL_STATE);
  const [ticketType, setTicketType] = useState<TicketType>("solo");

  useEffect(() => {
    if (state.status === "success") rememberTicket({ publicCode: state.publicCode, names: state.names });
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="space-y-5 border border-gold bg-card p-6 text-center">
        <TicketIcon className="mx-auto size-8 text-gold" aria-hidden />
        <h3 className="font-heading text-xl">{labels.success.title}</h3>
        <NamesLine names={state.names} />
        {state.reused && <p className="text-sm text-muted-foreground">{labels.success.existing}</p>}
        <p className="text-muted-foreground">{labels.success.body}</p>
        <DownloadLink publicCode={state.publicCode} label={labels.success.download} />
        <Button variant="ghost" onClick={onReset}>
          {labels.success.again}
        </Button>
      </div>
    );
  }

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "idle" ? { fullName: "", partnerName: "" } : state.values;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <TicketTypeChoice value={ticketType} onChange={setTicketType} labels={labels.type} />

      <Field data-invalid={errors.fullName !== undefined}>
        <FieldLabel htmlFor="fullName">{labels.fullName}</FieldLabel>
        <Input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="name"
          placeholder={labels.fullNamePlaceholder}
          defaultValue={values.fullName}
          aria-invalid={errors.fullName !== undefined}
        />
        {errors.fullName && <FieldError>{labels.errors[errors.fullName]}</FieldError>}
      </Field>

      {ticketType === "couple" && (
        <Field data-invalid={errors.partnerName !== undefined}>
          <FieldLabel htmlFor="partnerName">{labels.partnerName}</FieldLabel>
          <Input
            id="partnerName"
            name="partnerName"
            required
            minLength={2}
            maxLength={NAME_MAX_LENGTH}
            defaultValue={values.partnerName}
            aria-invalid={errors.partnerName !== undefined}
          />
          {errors.partnerName && <FieldError>{labels.errors[errors.partnerName]}</FieldError>}
        </Field>
      )}

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {labels.errors.generic}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}

export function TicketForm(props: TicketFormProps): ReactNode {
  // Remounting is the only way to reset useActionState for "create another ticket".
  const [formKey, setFormKey] = useState(0);
  const remembered = useRememberedTicket();

  return (
    <div className="space-y-6">
      {remembered && (
        <Alert>
          <TicketIcon aria-hidden />
          <AlertTitle>{props.labels.remembered}</AlertTitle>
          <AlertDescription className="space-y-3">
            <NamesLine names={remembered.names} />
            <DownloadLink publicCode={remembered.publicCode} label={props.labels.success.download} />
          </AlertDescription>
        </Alert>
      )}
      <TicketFormInner key={formKey} {...props} onReset={() => setFormKey((key) => key + 1)} />
    </div>
  );
}
