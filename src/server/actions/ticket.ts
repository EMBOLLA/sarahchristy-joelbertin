"use server";

import { requestTicket } from "@/server/tickets/service";
import {
  ticketRequestSchema,
  toFieldErrors,
  type TicketRequestFieldErrors,
} from "@/lib/wedding/ticket-request";

/** Echoed back so React 19's automatic form reset restores what the guest typed. */
export type TicketFormValues = Readonly<{ fullName: string; partnerName: string }>;

export type TicketFormState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "invalid"; errors: TicketRequestFieldErrors; values: TicketFormValues }>
  | Readonly<{ status: "error"; values: TicketFormValues }>
  | Readonly<{ status: "success"; publicCode: string; names: string[]; reused: boolean }>;

function optionalField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export async function submitTicketRequest(_previous: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const values: TicketFormValues = {
    fullName: optionalField(formData, "fullName") ?? "",
    partnerName: optionalField(formData, "partnerName") ?? "",
  };

  // Honeypot: invisible to humans, filled by naive bots.
  if (optionalField(formData, "website")) return { status: "error", values };

  const parsed = ticketRequestSchema.safeParse({
    ticketType: formData.get("ticketType"),
    fullName: formData.get("fullName"),
    partnerName: optionalField(formData, "partnerName"),
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    const errors = toFieldErrors(parsed.error);
    // Only non-field issues (tampered ticketType/locale) → generic error, no detail leaked.
    return Object.keys(errors).length > 0 ? { status: "invalid", errors, values } : { status: "error", values };
  }

  try {
    const { ticket, reused } = await requestTicket(parsed.data);
    const names = [ticket.primaryName, ticket.partnerName].filter((n): n is string => n !== null);
    return { status: "success", publicCode: ticket.publicCode, names, reused };
  } catch (error: unknown) {
    console.error("[ticket] request failed", error);
    return { status: "error", values };
  }
}
