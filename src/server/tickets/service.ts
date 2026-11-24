import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, inArray, isNotNull, or, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { guests, tickets, type Guest, type Ticket } from "@/server/db/schema";
import { nameMatchKey } from "@/lib/wedding/names";
import type { TicketRequest } from "@/lib/wedding/ticket-request";

export type TicketView = Readonly<{
  ticket: Ticket;
  guest: Guest | null;
  tableNumber: number | null;
  /** Listed as solo but asked for a couple ticket (or the reverse) — protocol must decide. */
  typeMismatch: boolean;
}>;

/** 128 bits, URL-safe: unguessable, so the QR needs no signature. */
function newPublicCode(): string {
  return randomBytes(16).toString("base64url");
}

function keysOf(request: TicketRequest): string[] {
  const keys = [nameMatchKey(request.fullName)];
  if (request.ticketType === "couple") keys.push(nameMatchKey(request.partnerName));
  return keys;
}

async function findGuestByKeys(keys: string[]): Promise<Guest | null> {
  const [guest] = await getDb()
    .select()
    .from(guests)
    .where(or(inArray(guests.matchKey, keys), inArray(guests.partnerMatchKey, keys)))
    .limit(1);
  return guest ?? null;
}

/**
 * A couple may register twice (each partner fills the form, names swapped):
 * any overlap of names on the same ticket type reuses the existing ticket.
 */
async function findExistingTicket(request: TicketRequest, keys: string[]): Promise<Ticket | null> {
  const [existing] = await getDb()
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.ticketType, request.ticketType),
        or(inArray(tickets.matchKey, keys), inArray(tickets.partnerMatchKey, keys)),
      ),
    )
    .limit(1);
  return existing ?? null;
}

export type RequestTicketResult = Readonly<{ ticket: Ticket; reused: boolean }>;

export async function requestTicket(request: TicketRequest): Promise<RequestTicketResult> {
  const keys = keysOf(request);
  const existing = await findExistingTicket(request, keys);
  if (existing) return { ticket: existing, reused: true };

  const guest = await findGuestByKeys(keys);
  const [created] = await getDb()
    .insert(tickets)
    .values({
      publicCode: newPublicCode(),
      ticketType: request.ticketType,
      primaryName: request.fullName,
      partnerName: request.ticketType === "couple" ? request.partnerName : null,
      matchKey: keys[0] ?? "",
      partnerMatchKey: keys[1] ?? null,
      guestId: guest?.id ?? null,
      matchStatus: guest ? "matched" : "unlisted",
      locale: request.locale,
    })
    .returning();

  if (!created) throw new Error("Ticket insert returned no row");
  return { ticket: created, reused: false };
}

function toView(ticket: Ticket, guest: Guest | null): TicketView {
  return {
    ticket,
    guest,
    tableNumber: guest?.tableNumber ?? null,
    typeMismatch: guest !== null && guest.ticketType !== ticket.ticketType,
  };
}

export async function findTicketView(publicCode: string): Promise<TicketView | null> {
  const [row] = await getDb()
    .select({ ticket: tickets, guest: guests })
    .from(tickets)
    .leftJoin(guests, eq(tickets.guestId, guests.id))
    .where(eq(tickets.publicCode, publicCode))
    .limit(1);
  return row ? toView(row.ticket, row.guest) : null;
}

export async function listTicketViews(): Promise<TicketView[]> {
  const rows = await getDb()
    .select({ ticket: tickets, guest: guests })
    .from(tickets)
    .leftJoin(guests, eq(tickets.guestId, guests.id))
    .orderBy(desc(tickets.createdAt));
  return rows.map((row) => toView(row.ticket, row.guest));
}

export async function setCheckedIn(publicCode: string, checkedIn: boolean): Promise<void> {
  await getDb()
    .update(tickets)
    .set({ checkedInAt: checkedIn ? new Date() : null })
    .where(eq(tickets.publicCode, publicCode));
}

export async function linkTicketToGuest(ticketId: string, guestId: string): Promise<void> {
  await getDb().update(tickets).set({ guestId, matchStatus: "manual" }).where(eq(tickets.id, ticketId));
}

/** "Add to the list" from an unlisted ticket: creates the guest from the ticket and links both. */
export async function promoteTicketHolderToGuest(ticketId: string): Promise<void> {
  const db = getDb();
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  if (!ticket || ticket.guestId) return;

  const [guest] = await db
    .insert(guests)
    .values({
      displayName: ticket.primaryName,
      partnerName: ticket.partnerName,
      matchKey: ticket.matchKey,
      partnerMatchKey: ticket.partnerMatchKey,
      ticketType: ticket.ticketType,
    })
    .returning({ id: guests.id });
  if (guest) await linkTicketToGuest(ticket.id, guest.id);
}

export async function deleteTicket(ticketId: string): Promise<void> {
  await getDb().delete(tickets).where(eq(tickets.id, ticketId));
}

/**
 * After the protocol adds/imports guests, tickets created earlier by those people
 * become "matched" automatically. One set-based statement, no N+1.
 */
export async function rematchUnlistedTickets(): Promise<number> {
  const ticketKeys = sql`(${tickets.matchKey}, ${tickets.partnerMatchKey})`;
  const updated = await getDb()
    .update(tickets)
    .set({ guestId: sql`${guests.id}`, matchStatus: "matched" })
    .from(guests)
    .where(
      and(
        eq(tickets.matchStatus, "unlisted"),
        or(sql`${guests.matchKey} IN ${ticketKeys}`, sql`${guests.partnerMatchKey} IN ${ticketKeys}`),
      ),
    )
    .returning({ id: tickets.id });
  return updated.length;
}

export type TicketStats = Readonly<{
  tickets: number;
  people: number;
  matched: number;
  unlisted: number;
  checkedInPeople: number;
}>;

export async function getTicketStats(): Promise<TicketStats> {
  const [row] = await getDb()
    .select({
      tickets: sql<number>`count(*)::int`,
      people: sql<number>`coalesce(sum(case when ${tickets.ticketType} = 'couple' then 2 else 1 end), 0)::int`,
      matched: sql<number>`count(*) filter (where ${tickets.matchStatus} <> 'unlisted')::int`,
      unlisted: sql<number>`count(*) filter (where ${tickets.matchStatus} = 'unlisted')::int`,
      checkedInPeople: sql<number>`coalesce(sum(case when ${tickets.ticketType} = 'couple' then 2 else 1 end) filter (where ${isNotNull(tickets.checkedInAt)}), 0)::int`,
    })
    .from(tickets);
  return row ?? { tickets: 0, people: 0, matched: 0, unlisted: 0, checkedInPeople: 0 };
}
