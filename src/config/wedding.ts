/**
 * Single source of truth for the event's static facts.
 * Everything editorial (names, date, venue) lives here; translations live in `src/i18n`.
 */

export type GeoPoint = Readonly<{ lat: number; lng: number }>;

export type Venue = Readonly<{
  name: string;
  address: string;
  /** Exact pin. `null` until verified — map links then search by `mapsQuery` instead. */
  location: GeoPoint | null;
  /** Place name as map apps know it (fallback when no verified coordinates). */
  mapsQuery: string;
  /** Google Maps share link of the exact pin (maps.app.goo.gl/…), when provided by the protocol. */
  googleMapsUrl: string | null;
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

// TODO(protocole): heure de la cérémonie et horaires du programme à confirmer.
// Cameroun : UTC+1 toute l'année (pas d'heure d'été) → offset +01:00.

/** Repère posé par le protocole sur le nouvel hôtel de ville. */
const MAIRIE_MBOUDA_PIN = "https://maps.app.goo.gl/RsHgZ1v3PkapS8Xo8";

export const WEDDING = {
  couple: { first: "Sarah Christy", second: "Joël Bertin" },
  ceremonyAt: "2027-03-27T14:00:00+01:00",
  endsAt: "2027-03-28T02:00:00+01:00",
  timeZone: "Africa/Douala",
  ceremony: {
    name: "Mairie de Mbouda",
    address: "Hôtel de Ville, Mbouda — Bamboutos, Région de l'Ouest, Cameroun",
    // TODO(protocole): coordonnées chiffrées du repère (appui long sur le pin dans Google Maps)
    // → active aussi la position exacte pour Waze et Apple Maps.
    location: null,
    mapsQuery: "Mairie de Mbouda, Mbouda, Cameroun",
    googleMapsUrl: MAIRIE_MBOUDA_PIN,
  },
  reception: {
    name: "Salle des fêtes de la Mairie",
    address: "Hôtel de Ville, Mbouda — Bamboutos, Région de l'Ouest, Cameroun",
    location: null,
    mapsQuery: "Mairie de Mbouda, Mbouda, Cameroun",
    googleMapsUrl: MAIRIE_MBOUDA_PIN,
  },
  schedule: [
    { id: "ceremony", at: "2027-03-27T14:00:00+01:00", venue: "ceremony" },
    { id: "cocktail", at: "2027-03-27T17:00:00+01:00", venue: "reception" },
    { id: "dinner", at: "2027-03-27T19:30:00+01:00", venue: "reception" },
    { id: "party", at: "2027-03-27T22:30:00+01:00", venue: "reception" },
  ],
  contact: {
    name: "Protocole",
    // +237 6 88 38 92 15 (Cameroun)
    whatsapp: "237688389215",
  },
  media: {
    heroVideo: null,
    heroPoster: null,
  },
} as const satisfies WeddingConfig;
