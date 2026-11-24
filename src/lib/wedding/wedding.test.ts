import { describe, expect, it } from "vitest";
import { nameMatchKey, normalizeName } from "./names";
import { getRemaining, getWeddingPhase } from "./phase";

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
