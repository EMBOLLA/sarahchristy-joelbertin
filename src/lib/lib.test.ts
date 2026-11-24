import { describe, expect, it } from "vitest";
import { parseGuestCsv, toCsv } from "./csv";
import { buildGoogleCalendarUrl, buildIcs, type CalendarEvent } from "./wedding/calendar";
import { ticketRequestSchema, toFieldErrors } from "./wedding/ticket-request";
import { safeNextPath } from "./safe-redirect";

describe("parseGuestCsv", () => {
  it("parses Excel paste with header, infers type, validates tables", () => {
    const { rows, errors } = parseGuestCsv(
      "Nom;Partenaire;Type;Table\nJean Mbeki;Marie Mbeki;;3\nPaul Ndong;;solo;\n\nX;;;",
      12,
    );
    expect(rows).toEqual([
      { displayName: "Jean Mbeki", partnerName: "Marie Mbeki", ticketType: "couple", tableNumber: 3 },
      { displayName: "Paul Ndong", partnerName: null, ticketType: "solo", tableNumber: null },
    ]);
    expect(errors).toEqual([{ line: 5, message: "Nom manquant" }]);
  });

  it("rejects out-of-range tables and unknown types", () => {
    const { errors } = parseGuestCsv("A B\t\t\t13\nC D,,trio,", 12);
    expect(errors.map((e) => e.line)).toEqual([1, 2]);
  });
});

describe("toCsv", () => {
  it("escapes separators and quotes, prefixes a BOM", () => {
    expect(toCsv([["a;b", 'say "hi"', "ok"]])).toBe('﻿"a;b";"say ""hi""";ok\r\n');
  });
});

describe("calendar", () => {
  const event: CalendarEvent = {
    uid: "x@y",
    title: "Mariage, enfin",
    description: "Line1\nLine2",
    location: "Mairie; Paris",
    start: new Date("2027-06-12T12:00:00Z"),
    end: new Date("2027-06-13T00:00:00Z"),
  };

  it("produces RFC 5545 text with escaping and CRLF", () => {
    const ics = buildIcs(event, new Date("2026-01-01T00:00:00Z"));
    expect(ics).toContain("DTSTART:20270612T120000Z\r\n");
    expect(ics).toContain("SUMMARY:Mariage\\, enfin\r\n");
    expect(ics).toContain("LOCATION:Mairie\\; Paris\r\n");
    expect(ics).toContain("DESCRIPTION:Line1\\nLine2\r\n");
  });

  it("builds a Google Calendar template link", () => {
    expect(buildGoogleCalendarUrl(event)).toContain("dates=20270612T120000Z%2F20270613T000000Z");
  });
});

describe("ticketRequestSchema", () => {
  it("requires the partner for couple tickets with a dedicated code", () => {
    const result = ticketRequestSchema.safeParse({ ticketType: "couple", fullName: "Jean Mbeki", locale: "fr" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)).toEqual({ partnerName: "partnerRequired" });
  });

  it("trims and accepts a solo ticket", () => {
    const result = ticketRequestSchema.safeParse({ ticketType: "solo", fullName: "  Paul  ", locale: "en" });
    expect(result.success && result.data.fullName).toBe("Paul");
  });

  it("rejects names without letters", () => {
    const result = ticketRequestSchema.safeParse({ ticketType: "solo", fullName: "1234", locale: "fr" });
    expect(result.success).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("only allows internal admin/check paths", () => {
    expect(safeNextPath("/fr/check/abc_DEF-123", "/fr/admin")).toBe("/fr/check/abc_DEF-123");
    expect(safeNextPath("//evil.com", "/fr/admin")).toBe("/fr/admin");
    expect(safeNextPath("https://evil.com/fr/check/x", "/fr/admin")).toBe("/fr/admin");
    expect(safeNextPath("/fr/check/x/../../y", "/fr/admin")).toBe("/fr/admin");
    expect(safeNextPath(null, "/en/admin")).toBe("/en/admin");
  });
});
