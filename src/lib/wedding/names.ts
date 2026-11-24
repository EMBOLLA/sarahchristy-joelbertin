/**
 * Canonical form used to cross-check an RSVP against the protocol's guest list.
 * "Jean-Pierre  MBÉKI" and "jean pierre mbeki" must collide.
 */
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Order-insensitive key: "Mbeki Jean" === "Jean Mbeki".
 * Guests often swap first/last name in forms.
 */
export function nameMatchKey(raw: string): string {
  return normalizeName(raw).split(" ").filter(Boolean).sort().join(" ");
}
