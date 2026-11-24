/**
 * Single source of truth for the event's static facts.
 * Everything editorial (names, date, venue) lives here; translations live in `src/i18n`.
 */

export type GeoPoint = Readonly<{ lat: number; lng: number }>;

export type Venue = Readonly<{
  name: string;
  address: string;
  location: GeoPoint;
}>;

/** Ids are translated in `dictionaries.schedule.items[id]`. */
export const SCHEDULE_IDS = ["ceremony", "cocktail", "dinner", "party"] as const;
export type ScheduleId = (typeof SCHEDULE_IDS)[number];

export type ScheduleStep = Readonly<{ id: ScheduleId; at: string; venue: "ceremony" | "reception" }>;

export type WeddingConfig = Readonly<{
  couple: Readonly<{ first: string; second: string }>;
  /** ISO 8601 with explicit offset, so the countdown never depends on the visitor's timezone. */
  ceremonyAt: string;
  /** End of the celebration — used for the calendar event. */
  endsAt: string;
  /** IANA timezone of the venue — used to decide "is it the wedding day?". */
  timeZone: string;
  ceremony: Venue;
  reception: Venue;
  schedule: ReadonlyArray<ScheduleStep>;
  contact: Readonly<{
    name: string;
    /** E.164 without "+" or spaces, as expected by wa.me links. */
    whatsapp: string;
  }>;
  media: Readonly<{
    /** Scrubbed hero video. `null` until the Canva export is ready → static fallback. */
    heroVideo: string | null;
    heroPoster: string | null;
  }>;
}>;

// TODO(protocole): remplacer les valeurs factices par les vraies infos.
export const WEDDING = {
  couple: { first: "Sarah Christy", second: "Joël Bertin" },
  ceremonyAt: "2027-06-12T14:00:00+02:00",
  endsAt: "2027-06-13T02:00:00+02:00",
  timeZone: "Europe/Paris",
  ceremony: {
    name: "Mairie",
    address: "Adresse à compléter",
    location: { lat: 48.8566, lng: 2.3522 },
  },
  reception: {
    name: "Salle de réception",
    address: "Adresse à compléter",
    location: { lat: 48.8566, lng: 2.3522 },
  },
  schedule: [
    { id: "ceremony", at: "2027-06-12T14:00:00+02:00", venue: "ceremony" },
    { id: "cocktail", at: "2027-06-12T17:00:00+02:00", venue: "reception" },
    { id: "dinner", at: "2027-06-12T19:30:00+02:00", venue: "reception" },
    { id: "party", at: "2027-06-12T22:30:00+02:00", venue: "reception" },
  ],
  contact: {
    name: "Protocole",
    whatsapp: "33600000000",
  },
  media: {
    heroVideo: null,
    heroPoster: null,
  },
} as const satisfies WeddingConfig;
