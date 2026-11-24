import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import QRCode from "qrcode";
import { WEDDING } from "@/config/wedding";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import type { TicketView } from "./service";
import { TICKET_LAYOUTS, type TextSlot } from "./pdf-layout";

const ASSETS_DIR = join(process.cwd(), "assets");

const COLORS = {
  ivory: rgb(0.98, 0.965, 0.94),
  terracotta: rgb(0.66, 0.325, 0.185),
  gold: rgb(0.745, 0.604, 0.27),
  ink: rgb(0.243, 0.172, 0.137),
} as const satisfies Record<string, RGB>;

type Fonts = Readonly<{ script: PDFFont; serif: PDFFont }>;

type Run = Readonly<{ text: string; font: PDFFont; size: number; color: RGB }>;

async function readOptional(path: string): Promise<Uint8Array | null> {
  try {
    return await readFile(path);
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

async function embedFonts(doc: PDFDocument): Promise<Fonts> {
  doc.registerFontkit(fontkit);
  const [script, serif] = await Promise.all([
    readFile(join(ASSETS_DIR, "fonts/PinyonScript-Regular.ttf")),
    readFile(join(ASSETS_DIR, "fonts/EBGaramond-400.ttf")),
  ]);
  // subset: false — pdf-lib's subsetter mangles some script ligatures.
  return {
    script: await doc.embedFont(script, { subset: false }),
    serif: await doc.embedFont(serif, { subset: false }),
  };
}

function runsWidth(runs: ReadonlyArray<Run>): number {
  return runs.reduce((total, run) => total + run.font.widthOfTextAtSize(run.text, run.size), 0);
}

/** Draws consecutive runs (e.g. gold initial + terracotta rest) centered as one line. */
function drawCenteredRuns(page: PDFPage, runs: ReadonlyArray<Run>, centerX: number, y: number): void {
  let x = centerX - runsWidth(runs) / 2;
  for (const run of runs) {
    page.drawText(run.text, { x, y, size: run.size, font: run.font, color: run.color });
    x += run.font.widthOfTextAtSize(run.text, run.size);
  }
}

function drawCentered(page: PDFPage, text: string, font: PDFFont, size: number, color: RGB, centerX: number, y: number): void {
  drawCenteredRuns(page, [{ text, font, size, color }], centerX, y);
}

/** Script name with a gold first letter, auto-shrunk to fit the slot. */
function goldInitialRuns(text: string, font: PDFFont, size: number): Run[] {
  const [initial = "", ...rest] = Array.from(text);
  return [
    { text: initial, font, size, color: COLORS.gold },
    { text: rest.join(""), font, size, color: COLORS.terracotta },
  ];
}

function fitSize(lines: ReadonlyArray<string>, font: PDFFont, slot: TextSlot): number {
  for (let size = slot.maxSize; size > slot.minSize; size -= 1) {
    if (lines.every((line) => font.widthOfTextAtSize(line, size) <= slot.maxWidth)) return size;
  }
  return slot.minSize;
}

function drawNames(page: PDFPage, names: ReadonlyArray<string>, fonts: Fonts, slot: TextSlot): void {
  const size = fitSize(names, fonts.script, slot);
  names.forEach((name, index) => {
    const y = slot.y - index * (size * 1.6 + slot.lineGap);
    if (index > 0) {
      drawCentered(page, "&", fonts.script, size * 0.7, COLORS.gold, slot.centerX, y + size * 0.8 + slot.lineGap / 2);
    }
    drawCenteredRuns(page, goldInitialRuns(name, fonts.script, size), slot.centerX, y);
  });
}

function drawLozenge(page: PDFPage, x: number, y: number, size: number, filled: boolean): void {
  const half = size / 2;
  page.drawSvgPath(`M 0 ${-half} L ${half} 0 L 0 ${half} L ${-half} 0 Z`, {
    x,
    y,
    color: filled ? COLORS.gold : undefined,
    borderColor: COLORS.gold,
    borderWidth: 1,
  });
}

/** Static design used until the real template PDFs are provided. */
function drawFallbackDesign(page: PDFPage, fonts: Fonts, locale: Locale): void {
  const { width, height } = page.getSize();
  const center = width / 2;
  const labels = DICTIONARIES[locale].ticketPdf;

  page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.ivory });
  page.drawRectangle({ x: 14, y: 14, width: width - 28, height: height - 28, borderColor: COLORS.terracotta, borderWidth: 1.5 });
  page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: COLORS.gold, borderWidth: 0.6 });

  drawCenteredRuns(
    page,
    [
      ...goldInitialRuns(WEDDING.couple.first, fonts.script, 30),
      { text: "  &  ", font: fonts.script, size: 24, color: COLORS.gold },
      ...goldInitialRuns(WEDDING.couple.second, fonts.script, 30),
    ],
    center,
    height - 92,
  );

  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: WEDDING.timeZone,
  }).format(new Date(WEDDING.ceremonyAt));
  drawCentered(page, date, fonts.serif, 11, COLORS.ink, center, height - 122);
  drawCentered(page, WEDDING.reception.name, fonts.serif, 11, COLORS.ink, center, height - 138);

  page.drawLine({ start: { x: center - 60, y: height - 162 }, end: { x: center + 60, y: height - 162 }, thickness: 0.6, color: COLORS.gold });
  drawCentered(page, labels.heading.toUpperCase(), fonts.serif, 12, COLORS.terracotta, center, height - 190);
  drawCentered(page, labels.scanHint, fonts.serif, 9, COLORS.ink, center, 60);
}

async function loadBase(type: TicketView["ticket"]["ticketType"]): Promise<{ doc: PDFDocument; isTemplate: boolean }> {
  const template = await readOptional(join(ASSETS_DIR, `tickets/ticket-${type}.pdf`));
  if (template) return { doc: await PDFDocument.load(template), isTemplate: true };

  const doc = await PDFDocument.create();
  doc.addPage([...TICKET_LAYOUTS[type].pageSize]);
  return { doc, isTemplate: false };
}

export async function renderTicketPdf(view: TicketView, checkUrl: string): Promise<Uint8Array> {
  const { ticket, tableNumber } = view;
  const locale: Locale = isLocale(ticket.locale) ? ticket.locale : DEFAULT_LOCALE;
  const labels = DICTIONARIES[locale].ticketPdf;
  const layout = TICKET_LAYOUTS[ticket.ticketType];

  const { doc, isTemplate } = await loadBase(ticket.ticketType);
  const fonts = await embedFonts(doc);
  const page = doc.getPage(0);

  if (!isTemplate) drawFallbackDesign(page, fonts, locale);

  const names = ticket.partnerName ? [ticket.primaryName, ticket.partnerName] : [ticket.primaryName];
  drawNames(page, names, fonts, layout.names);

  drawCentered(page, labels.admits[ticket.ticketType], fonts.serif, layout.admits.size, COLORS.ink, layout.admits.centerX, layout.admits.y);
  drawCentered(
    page,
    tableNumber === null ? labels.tableTbd : `${labels.table} ${tableNumber}`,
    fonts.serif,
    tableNumber === null ? layout.table.size * 0.8 : layout.table.size,
    COLORS.terracotta,
    layout.table.centerX,
    layout.table.y,
  );

  const qrPng = await QRCode.toBuffer(checkUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 600,
    color: { dark: "#3E2C23", light: "#FAF6F0" },
  });
  const qrImage = await doc.embedPng(qrPng);
  page.drawImage(qrImage, { x: layout.qr.x, y: layout.qr.y, width: layout.qr.size, height: layout.qr.size });

  drawLozenge(page, layout.mark.x, layout.mark.y, layout.mark.size, ticket.matchStatus !== "unlisted");
  drawCentered(page, `${labels.reference} ${ticket.publicCode.slice(0, 8)}`, fonts.serif, layout.reference.size, COLORS.ink, layout.reference.centerX, layout.reference.y);

  doc.setTitle(`${labels.heading} — ${names.join(" & ")}`);
  doc.setCreator(`${WEDDING.couple.first} & ${WEDDING.couple.second}`);
  return doc.save();
}
