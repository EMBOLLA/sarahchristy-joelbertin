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

export type WeddingConfig = Readonly<{
  couple: Readonly<{ first: string; second: string }>;
  /** ISO 8601 with explicit offset, so the countdown never depends on the visitor's timezone. */
  ceremonyAt: string;
  /** IANA timezone of the venue — used to decide "is it the wedding day?". */
  timeZone: string;
  ceremony: Venue;
  reception: Venue;
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
  media: {
    heroVideo: null,
    heroPoster: null,
  },
} as const satisfies WeddingConfig;
