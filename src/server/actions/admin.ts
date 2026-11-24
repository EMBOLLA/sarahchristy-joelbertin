"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { assertAdmin, closeAdminSession, isValidAdminPassword, openAdminSession } from "@/server/auth/session";
import { addGuests, deleteGuest, setGuestTable } from "@/server/guests/service";
import {
  deleteTicket,
  linkTicketToGuest,
  promoteTicketHolderToGuest,
  setCheckedIn,
} from "@/server/tickets/service";
import { createFaq, deleteFaq, FAQ_CACHE_TAG, updateFaq } from "@/server/faq/service";
import { getSeatingEnv } from "@/server/env";
import { parseGuestCsv, type CsvLineError } from "@/lib/csv";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { safeNextPath } from "@/lib/safe-redirect";

/*
 * Every action re-checks the session: a Server Action is a public POST endpoint,
 * whatever page renders it. Bound arguments come from the client too → validated.
 */

const uuid = z.uuid();
const publicCode = z.string().regex(/^[A-Za-z0-9_-]{22}$/);

function localeFrom(formData: FormData): Locale {
  const value = formData.get("locale");
  return typeof value === "string" && isLocale(value) ? value : DEFAULT_LOCALE;
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// ── Session ────────────────────────────────────────────────────────────────

export type LoginState = Readonly<{ error: boolean }>;

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isValidAdminPassword(text(formData, "password"))) return { error: true };
  await openAdminSession();
  const locale = localeFrom(formData);
  redirect(safeNextPath(text(formData, "next"), `/${locale}/admin`));
}

export async function logoutAction(formData: FormData): Promise<void> {
  await closeAdminSession();
  redirect(`/${localeFrom(formData)}/admin/login`);
}

// ── Tickets ────────────────────────────────────────────────────────────────

export async function setCheckedInAction(code: string, checkedIn: boolean): Promise<void> {
  await assertAdmin();
  await setCheckedIn(publicCode.parse(code), z.boolean().parse(checkedIn));
  refresh();
}

export async function linkTicketAction(ticketId: string, formData: FormData): Promise<void> {
  await assertAdmin();
  const guestId = uuid.safeParse(text(formData, "guestId"));
  if (!guestId.success) return;
  await linkTicketToGuest(uuid.parse(ticketId), guestId.data);
  refresh();
}

export async function promoteTicketAction(ticketId: string): Promise<void> {
  await assertAdmin();
  await promoteTicketHolderToGuest(uuid.parse(ticketId));
  refresh();
}

export async function deleteTicketAction(ticketId: string): Promise<void> {
  await assertAdmin();
  await deleteTicket(uuid.parse(ticketId));
  refresh();
}

// ── Guests ─────────────────────────────────────────────────────────────────

export type GuestImportState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "done"; added: number; rematched: number; errors: CsvLineError[] }>;

/** Same pipeline for the single-guest form and the CSV paste: one validation path. */
export async function importGuestsAction(_previous: GuestImportState, formData: FormData): Promise<GuestImportState> {
  await assertAdmin();
  const { WEDDING_TABLE_COUNT } = getSeatingEnv();

  const csv =
    text(formData, "csv") ||
    [text(formData, "displayName"), text(formData, "partnerName"), text(formData, "ticketType"), text(formData, "tableNumber")].join(";");

  const { rows, errors } = parseGuestCsv(csv, WEDDING_TABLE_COUNT);
  if (errors.length > 0) return { status: "done", added: 0, rematched: 0, errors };

  const { added, rematched } = await addGuests(rows);
  refresh();
  return { status: "done", added, rematched, errors: [] };
}

export async function setGuestTableAction(guestId: string, formData: FormData): Promise<void> {
  await assertAdmin();
  const { WEDDING_TABLE_COUNT } = getSeatingEnv();
  const raw = text(formData, "tableNumber");
  const table = raw === "" ? null : z.coerce.number().int().min(1).max(WEDDING_TABLE_COUNT).parse(raw);
  await setGuestTable(uuid.parse(guestId), table);
  refresh();
}

export async function deleteGuestAction(guestId: string): Promise<void> {
  await assertAdmin();
  await deleteGuest(uuid.parse(guestId));
  refresh();
}

// ── FAQ ────────────────────────────────────────────────────────────────────

const faqSchema = z.object({
  questionFr: z.string().trim().min(3).max(300),
  answerFr: z.string().trim().min(1).max(3000),
  questionEn: z.string().trim().min(3).max(300),
  answerEn: z.string().trim().min(1).max(3000),
  position: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});

export type FaqFormState = Readonly<{ status: "idle" | "saved" | "invalid" }>;

export async function saveFaqAction(_previous: FaqFormState, formData: FormData): Promise<FaqFormState> {
  await assertAdmin();
  const rawId = text(formData, "faqId");
  const parsed = faqSchema.safeParse({
    questionFr: text(formData, "questionFr"),
    answerFr: text(formData, "answerFr"),
    questionEn: text(formData, "questionEn"),
    answerEn: text(formData, "answerEn"),
    position: text(formData, "position") || "0",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { status: "invalid" };

  if (rawId === "") await createFaq(parsed.data);
  else await updateFaq(uuid.parse(rawId), parsed.data);

  // Public page: guests see the change on their next visit (read-your-own-writes for the admin).
  updateTag(FAQ_CACHE_TAG);
  refresh();
  return { status: "saved" };
}

export async function deleteFaqAction(faqId: string): Promise<void> {
  await assertAdmin();
  await deleteFaq(uuid.parse(faqId));
  updateTag(FAQ_CACHE_TAG);
  refresh();
}
