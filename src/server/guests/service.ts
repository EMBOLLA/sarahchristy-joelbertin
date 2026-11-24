import "server-only";
import { asc, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { guests, tickets, type Guest } from "@/server/db/schema";
import { nameMatchKey } from "@/lib/wedding/names";
import type { GuestCsvRow } from "@/lib/csv";
import { rematchUnlistedTickets } from "@/server/tickets/service";

export type GuestInput = GuestCsvRow;

function toRow(input: GuestInput): typeof guests.$inferInsert {
  return {
    displayName: input.displayName,
    partnerName: input.partnerName,
    matchKey: nameMatchKey(input.displayName),
    partnerMatchKey: input.partnerName ? nameMatchKey(input.partnerName) : null,
    ticketType: input.ticketType,
    tableNumber: input.tableNumber,
  };
}

export type GuestWithTicket = Guest & Readonly<{ hasTicket: boolean }>;

export async function listGuests(): Promise<GuestWithTicket[]> {
  const rows = await getDb()
    .select({
      guest: guests,
      ticketCount: sql<number>`count(${tickets.id})::int`,
    })
    .from(guests)
    .leftJoin(tickets, eq(tickets.guestId, guests.id))
    .groupBy(guests.id)
    .orderBy(asc(guests.tableNumber), asc(guests.displayName));
  return rows.map(({ guest, ticketCount }) => ({ ...guest, hasTicket: ticketCount > 0 }));
}

/** Inserts then re-matches: people who registered before being listed get matched now. */
export async function addGuests(inputs: ReadonlyArray<GuestInput>): Promise<{ added: number; rematched: number }> {
  if (inputs.length === 0) return { added: 0, rematched: 0 };
  await getDb().insert(guests).values(inputs.map(toRow));
  const rematched = await rematchUnlistedTickets();
  return { added: inputs.length, rematched };
}

export async function setGuestTable(guestId: string, tableNumber: number | null): Promise<void> {
  await getDb().update(guests).set({ tableNumber }).where(eq(guests.id, guestId));
}

export async function deleteGuest(guestId: string): Promise<void> {
  const db = getDb();
  // Linked tickets fall back to "unlisted" before the FK nulls their guest_id.
  await db.update(tickets).set({ matchStatus: "unlisted", guestId: null }).where(eq(tickets.guestId, guestId));
  await db.delete(guests).where(eq(guests.id, guestId));
}

export type TableOccupancy = ReadonlyMap<number, number>;

/** Seats taken per table (couple = 2). */
export async function getTableOccupancy(): Promise<TableOccupancy> {
  const rows = await getDb()
    .select({
      table: guests.tableNumber,
      seats: sql<number>`sum(case when ${guests.ticketType} = 'couple' then 2 else 1 end)::int`,
    })
    .from(guests)
    .where(isNotNull(guests.tableNumber))
    .groupBy(guests.tableNumber);

  return new Map(rows.flatMap(({ table, seats }) => (table === null ? [] : [[table, seats] as const])));
}
