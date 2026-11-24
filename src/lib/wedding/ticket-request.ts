import { z } from "zod";
import { LOCALES } from "@/i18n/config";

import type { TicketType } from "./ticket-types";

export { TICKET_TYPES, type TicketType } from "./ticket-types";

export const NAME_MAX_LENGTH = 80;

/** Error codes map 1:1 to `dictionary.rsvp.errors` keys — the server never returns prose. */
export type TicketRequestErrorCode = "nameRequired" | "nameTooLong" | "partnerRequired";

const personName = (requiredCode: TicketRequestErrorCode): z.ZodString =>
  z
    .string({ error: requiredCode })
    .trim()
    .min(2, { error: requiredCode })
    .max(NAME_MAX_LENGTH, { error: "nameTooLong" satisfies TicketRequestErrorCode })
    .regex(/\p{L}/u, { error: requiredCode });

export const ticketRequestSchema = z.discriminatedUnion("ticketType", [
  z.object({
    ticketType: z.literal("solo"),
    fullName: personName("nameRequired"),
    locale: z.enum(LOCALES),
  }),
  z.object({
    ticketType: z.literal("couple"),
    fullName: personName("nameRequired"),
    partnerName: personName("partnerRequired"),
    locale: z.enum(LOCALES),
  }),
]);

export type TicketRequest = z.infer<typeof ticketRequestSchema>;

export type TicketRequestFieldErrors = Partial<Record<"fullName" | "partnerName", TicketRequestErrorCode>>;

export function toFieldErrors(error: z.ZodError): TicketRequestFieldErrors {
  const result: TicketRequestFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "fullName" || field === "partnerName") && result[field] === undefined) {
      result[field] = issue.message as TicketRequestErrorCode;
    }
  }
  return result;
}

/** Couple tickets admit 2 people — used for headcounts. */
export function seatsFor(type: TicketType): 1 | 2 {
  return type === "couple" ? 2 : 1;
}
