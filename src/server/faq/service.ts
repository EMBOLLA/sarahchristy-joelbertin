import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/server/db/client";
import { faqItems, type FaqItem } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import type { Locale } from "@/i18n/config";

export const FAQ_CACHE_TAG = "faq";

export type PublicFaqEntry = Readonly<{ id: string; question: string; answer: string }>;

/**
 * Cached across requests and baked into the static shell; the back-office calls
 * `updateTag(FAQ_CACHE_TAG)` after each edit, so guests see changes on the next visit.
 */
export async function getPublishedFaq(locale: Locale): Promise<PublicFaqEntry[]> {
  "use cache";
  cacheTag(FAQ_CACHE_TAG);
  cacheLife("days");

  // Lets `next build` run without a database (CI, first local build).
  if (!isDatabaseConfigured()) return [];

  const rows = await getDb()
    .select()
    .from(faqItems)
    .where(eq(faqItems.published, true))
    .orderBy(asc(faqItems.position), asc(faqItems.createdAt));

  return rows.map((row) => ({
    id: row.id,
    question: locale === "fr" ? row.questionFr : row.questionEn,
    answer: locale === "fr" ? row.answerFr : row.answerEn,
  }));
}

export async function listAllFaq(): Promise<FaqItem[]> {
  return getDb().select().from(faqItems).orderBy(asc(faqItems.position), asc(faqItems.createdAt));
}

export type FaqInput = Readonly<{
  questionFr: string;
  answerFr: string;
  questionEn: string;
  answerEn: string;
  position: number;
  published: boolean;
}>;

export async function createFaq(input: FaqInput): Promise<void> {
  await getDb().insert(faqItems).values(input);
}

export async function updateFaq(id: string, input: FaqInput): Promise<void> {
  await getDb().update(faqItems).set(input).where(eq(faqItems.id, id));
}

export async function deleteFaq(id: string): Promise<void> {
  await getDb().delete(faqItems).where(eq(faqItems.id, id));
}
