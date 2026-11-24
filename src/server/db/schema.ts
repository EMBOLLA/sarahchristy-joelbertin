import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const ticketType = pgEnum("ticket_type", ["solo", "couple"]);

/**
 * Result of cross-checking a submission against the protocol's list:
 * - matched:  found in `guests` → ticket shows the "invité" mark (+ table once assigned)
 * - unlisted: not found → ticket still generated, flagged for the protocol at the door
 * - manual:   protocol linked/validated it by hand in the back-office
 */
export const matchStatus = pgEnum("match_status", ["matched", "unlisted", "manual"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Expected guests, imported/managed by the protocol team. */
export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    displayName: text("display_name").notNull(),
    /** `nameMatchKey(displayName)` — see src/lib/wedding/names.ts */
    matchKey: text("match_key").notNull(),
    ticketType: ticketType("ticket_type").notNull(),
    tableNumber: integer("table_number"),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    index("guests_match_key_idx").on(t.matchKey),
    check("guests_table_positive", sql`${t.tableNumber} IS NULL OR ${t.tableNumber} > 0`),
  ],
);

/** One row per ticket generated through the public form. */
export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Opaque, unguessable id encoded in the QR code (≥128 bits). Never the PK. */
    publicCode: text("public_code").notNull().unique(),
    ticketType: ticketType("ticket_type").notNull(),
    primaryName: text("primary_name").notNull(),
    partnerName: text("partner_name"),
    matchKey: text("match_key").notNull(),
    guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
    matchStatus: matchStatus("match_status").notNull(),
    locale: text("locale").notNull(),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("tickets_match_key_idx").on(t.matchKey),
    check(
      "tickets_partner_matches_type",
      sql`(${t.ticketType} = 'couple') = (${t.partnerName} IS NOT NULL)`,
    ),
  ],
);

/** Bilingual FAQ, editable from the back-office. */
export const faqItems = pgTable("faq_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionFr: text("question_fr").notNull(),
  answerFr: text("answer_fr").notNull(),
  questionEn: text("question_en").notNull(),
  answerEn: text("answer_en").notNull(),
  position: integer("position").notNull().default(0),
  published: boolean("published").notNull().default(true),
  ...timestamps,
});

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type FaqItem = typeof faqItems.$inferSelect;
