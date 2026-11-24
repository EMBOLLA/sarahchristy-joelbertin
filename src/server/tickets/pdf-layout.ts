import type { TicketType } from "@/lib/wedding/ticket-request";

/**
 * Where dynamic content lands on the ticket, in PDF points (1/72 inch), origin BOTTOM-LEFT.
 * When the real templates arrive (assets/tickets/ticket-{solo,couple}.pdf), only these
 * numbers need adjusting — see docs/TICKETS.md.
 */

export type TextSlot = Readonly<{
  /** Horizontal center of the text. */
  centerX: number;
  /** Baseline of the first line. */
  y: number;
  /** Text shrinks from maxSize down to minSize to fit this width. */
  maxWidth: number;
  maxSize: number;
  minSize: number;
  lineGap: number;
}>;

export type TicketLayout = Readonly<{
  /** Page size used only when no template exists (A5 portrait). */
  pageSize: readonly [number, number];
  names: TextSlot;
  admits: Readonly<{ centerX: number; y: number; size: number }>;
  table: Readonly<{ centerX: number; y: number; size: number }>;
  qr: Readonly<{ x: number; y: number; size: number }>;
  /** Protocol mark: filled lozenge = on the list, hollow = not on the list. */
  mark: Readonly<{ x: number; y: number; size: number }>;
  reference: Readonly<{ centerX: number; y: number; size: number }>;
}>;

const BASE: TicketLayout = {
  pageSize: [420, 595],
  names: { centerX: 210, y: 352, maxWidth: 330, maxSize: 34, minSize: 18, lineGap: 6 },
  admits: { centerX: 210, y: 262, size: 11 },
  table: { centerX: 210, y: 240, size: 14 },
  qr: { x: 160, y: 92, size: 100 },
  mark: { x: 280, y: 100, size: 9 },
  reference: { centerX: 210, y: 76, size: 8 },
};

export const TICKET_LAYOUTS: Readonly<Record<TicketType, TicketLayout>> = {
  solo: BASE,
  couple: { ...BASE, names: { ...BASE.names, y: 360, maxSize: 30 } },
};
