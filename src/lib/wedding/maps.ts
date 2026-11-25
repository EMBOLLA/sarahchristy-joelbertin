import type { Venue } from "@/config/wedding";

export type MapProvider = "google" | "waze" | "apple";

/**
 * Universal links: on mobile they open the native app when installed (GPS directions),
 * otherwise the website. No `geo:` URI — unsupported on iOS.
 *
 * Exact coordinates win when known. Google can also open the protocol's shared pin.
 * Otherwise the app resolves the place by name, which beats approximate coordinates
 * that would drop guests a few blocks away.
 */
export function buildDirectionsUrl(
  provider: MapProvider,
  venue: Pick<Venue, "location" | "mapsQuery" | "googleMapsUrl">,
): string {
  const coords = venue.location ? `${venue.location.lat},${venue.location.lng}` : null;
  const target = encodeURIComponent(coords ?? venue.mapsQuery);

  switch (provider) {
    case "google":
      // Priority: exact coords (opens directions) > protocol's shared pin > name search.
      if (!coords && venue.googleMapsUrl) return venue.googleMapsUrl;
      return `https://www.google.com/maps/dir/?api=1&destination=${target}`;
    case "waze":
      return coords ? `https://waze.com/ul?ll=${target}&navigate=yes` : `https://waze.com/ul?q=${target}&navigate=yes`;
    case "apple":
      return `https://maps.apple.com/?daddr=${target}`;
  }
}

export const MAP_PROVIDERS: ReadonlyArray<{ id: MapProvider; label: string }> = [
  { id: "google", label: "Google Maps" },
  { id: "waze", label: "Waze" },
  { id: "apple", label: "Apple Maps" },
];
