import { describe, expect, it } from "vitest";
import { nameMatchKey, normalizeName } from "./names";
import { getRemaining, getWeddingPhase } from "./phase";
import { buildDirectionsUrl } from "./maps";

describe("names", () => {
  it("strips accents, case, punctuation and extra spaces", () => {
    expect(normalizeName("  Jean-Pierre   MBÉKI ")).toBe("jean pierre mbeki");
  });

  it("is order-insensitive for matching", () => {
    expect(nameMatchKey("Mbéki Jean")).toBe(nameMatchKey("jean MBEKI"));
  });
});

describe("getWeddingPhase", () => {
  const ceremony = new Date("2027-06-12T14:00:00+02:00");
  const tz = "Europe/Paris";

  it("uses the venue's calendar day, not UTC", () => {
    // 23:30 UTC on the 11th is already the 12th in Paris.
    expect(getWeddingPhase(new Date("2027-06-11T22:30:00Z"), ceremony, tz)).toBe("day");
    expect(getWeddingPhase(new Date("2027-06-11T21:30:00Z"), ceremony, tz)).toBe("before");
    expect(getWeddingPhase(new Date("2027-06-12T22:30:00Z"), ceremony, tz)).toBe("after");
  });
});

describe("getRemaining", () => {
  it("splits the duration and returns null once passed", () => {
    const target = new Date("2027-01-02T01:01:01Z");
    expect(getRemaining(new Date("2027-01-01T00:00:00Z"), target)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
    expect(getRemaining(target, target)).toBeNull();
  });
});

describe("buildDirectionsUrl", () => {
  const byName = { location: null, mapsQuery: "Mairie de Mbouda, Mbouda, Cameroun", googleMapsUrl: null };
  const byPin = { location: { lat: 5.6243, lng: 10.2551 }, mapsQuery: "ignored", googleMapsUrl: "https://maps.app.goo.gl/x" };
  const byShareLink = { ...byName, googleMapsUrl: "https://maps.app.goo.gl/RsHgZ1v3PkapS8Xo8" };

  it("searches by place name when no verified pin exists", () => {
    expect(buildDirectionsUrl("google", byName)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=Mairie%20de%20Mbouda%2C%20Mbouda%2C%20Cameroun",
    );
    expect(buildDirectionsUrl("waze", byName)).toContain("waze.com/ul?q=Mairie%20de%20Mbouda");
  });

  it("opens the shared Google pin, other apps still search by name", () => {
    expect(buildDirectionsUrl("google", byShareLink)).toBe("https://maps.app.goo.gl/RsHgZ1v3PkapS8Xo8");
    expect(buildDirectionsUrl("waze", byShareLink)).toContain("waze.com/ul?q=Mairie%20de%20Mbouda");
  });

  it("uses exact coordinates when provided", () => {
    expect(buildDirectionsUrl("google", byPin)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=5.6243%2C10.2551",
    );
    expect(buildDirectionsUrl("waze", byPin)).toBe("https://waze.com/ul?ll=5.6243%2C10.2551&navigate=yes");
    expect(buildDirectionsUrl("apple", byPin)).toBe("https://maps.apple.com/?daddr=5.6243%2C10.2551");
  });
});

describe("getWeddingPhase in Cameroon", () => {
  it("switches at midnight Douala time (UTC+1)", () => {
    const ceremony = new Date("2027-03-27T14:00:00+01:00");
    expect(getWeddingPhase(new Date("2027-03-26T22:59:00Z"), ceremony, "Africa/Douala")).toBe("before");
    expect(getWeddingPhase(new Date("2027-03-26T23:00:00Z"), ceremony, "Africa/Douala")).toBe("day");
  });
});
