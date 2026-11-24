import { describe, expect, it } from "vitest";
import { pathnameHasLocale, resolveLocale } from "./config";

describe("resolveLocale", () => {
  it("prefers the explicit cookie over the device language", () => {
    expect(resolveLocale("en", "fr-FR,fr;q=0.9")).toBe("en");
  });

  it("maps regional variants to the base language", () => {
    expect(resolveLocale(undefined, "en-GB,en;q=0.9")).toBe("en");
    expect(resolveLocale(undefined, "fr-CA")).toBe("fr");
  });

  it("honours q-values", () => {
    expect(resolveLocale(undefined, "de;q=1,en;q=0.5,fr;q=0.8")).toBe("fr");
  });

  it("falls back to the default for unsupported or missing languages", () => {
    expect(resolveLocale(undefined, "de-DE,es;q=0.9")).toBe("fr");
    expect(resolveLocale("xx", null)).toBe("fr");
  });
});

describe("pathnameHasLocale", () => {
  it("detects a locale segment without false positives", () => {
    expect(pathnameHasLocale("/en")).toBe(true);
    expect(pathnameHasLocale("/fr/admin")).toBe(true);
    expect(pathnameHasLocale("/english")).toBe(false);
    expect(pathnameHasLocale("/")).toBe(false);
  });
});
