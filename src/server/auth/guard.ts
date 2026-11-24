import "server-only";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/get-dictionary";
import { isAdmin } from "./session";

/**
 * Page-level guard (Server Components only — uses root params).
 * Must be called INSIDE a <Suspense> boundary: it reads cookies.
 */
export async function requireAdminPage(): Promise<void> {
  if (await isAdmin()) return;
  redirect(`/${await getLocale()}/admin/login`);
}
