import type { GeoPoint } from "@/config/wedding";

export type MapProvider = "google" | "waze" | "apple";

/**
 * Universal links: on mobile they open the native app when installed (GPS directions),
 * otherwise the website. No `geo:` URI — unsupported on iOS.
 */
export function buildDirectionsUrl(provider: MapProvider, { lat, lng }: GeoPoint): string {
  const coords = `${lat},${lng}`;
  switch (provider) {
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`;
    case "waze":
      return `https://waze.com/ul?ll=${encodeURIComponent(coords)}&navigate=yes`;
    case "apple":
      return `https://maps.apple.com/?daddr=${encodeURIComponent(coords)}`;
  }
}

export const MAP_PROVIDERS: ReadonlyArray<{ id: MapProvider; label: string }> = [
  { id: "google", label: "Google Maps" },
  { id: "waze", label: "Waze" },
  { id: "apple", label: "Apple Maps" },
];
