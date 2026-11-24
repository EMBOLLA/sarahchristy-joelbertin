import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  /** Shared password for the protocol team's back-office. */
  ADMIN_PASSWORD: z.string().min(12),
  /** HMAC secret for the admin session cookie (jose). `openssl rand -base64 32` */
  SESSION_SECRET: z.string().min(32),
  /** Number of tables at the reception; drives table assignment in the back-office. */
  WEDDING_TABLE_COUNT: z.coerce.number().int().positive().default(20),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Validated lazily (not at import): `next build` must succeed without secrets,
 * but the first request with a broken config fails loudly instead of half-working.
 */
export function getServerEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse(process.env);
  return cached;
}
