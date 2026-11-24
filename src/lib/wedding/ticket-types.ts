/** Dependency-free on purpose: imported by the Drizzle schema, which drizzle-kit loads without path aliases. */
export const TICKET_TYPES = ["solo", "couple"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];
