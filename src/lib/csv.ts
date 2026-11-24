import type { TicketType } from "@/lib/wedding/ticket-request";

export type GuestCsvRow = Readonly<{
  displayName: string;
  partnerName: string | null;
  ticketType: TicketType;
  tableNumber: number | null;
}>;

export type CsvLineError = Readonly<{ line: number; message: string }>;

export type GuestCsvParseResult = Readonly<{ rows: GuestCsvRow[]; errors: CsvLineError[] }>;

const HEADER_HINTS = ["nom", "name"];

function detectSeparator(line: string): string {
  if (line.includes("\t")) return "\t";
  if (line.includes(";")) return ";";
  return ",";
}

/**
 * Accepts what the protocol team will realistically paste from Excel / Google Sheets:
 *   Nom ; Partenaire ; Type (solo|couple) ; Table
 * Header row optional, separator auto-detected, type inferred from the partner column when empty.
 */
export function parseGuestCsv(text: string, tableCount: number): GuestCsvParseResult {
  const rows: GuestCsvRow[] = [];
  const errors: CsvLineError[] = [];
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    if (rawLine.trim() === "") return;

    const cells = rawLine.split(detectSeparator(rawLine)).map((cell) => cell.trim().replace(/^"|"$/g, ""));
    const [name = "", partner = "", type = "", table = ""] = cells;

    if (index === 0 && HEADER_HINTS.includes(name.toLowerCase())) return;
    if (name.length < 2) {
      errors.push({ line: lineNumber, message: "Nom manquant" });
      return;
    }

    const normalizedType = type.toLowerCase();
    if (normalizedType !== "" && normalizedType !== "solo" && normalizedType !== "couple") {
      errors.push({ line: lineNumber, message: `Type inconnu « ${type} » (solo ou couple)` });
      return;
    }
    const ticketType: TicketType = normalizedType === "" ? (partner ? "couple" : "solo") : normalizedType;

    let tableNumber: number | null = null;
    if (table !== "") {
      const parsed = Number.parseInt(table, 10);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > tableCount) {
        errors.push({ line: lineNumber, message: `Table invalide « ${table} » (1 à ${tableCount})` });
        return;
      }
      tableNumber = parsed;
    }

    rows.push({ displayName: name, partnerName: partner || null, ticketType, tableNumber });
  });

  return { rows, errors };
}

function escapeCell(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** `;`-separated with a UTF-8 BOM: opens correctly in French Excel (accents included). */
export function toCsv(rows: ReadonlyArray<ReadonlyArray<string>>): string {
  return `﻿${rows.map((row) => row.map(escapeCell).join(";")).join("\r\n")}\r\n`;
}
