import "server-only";
import { z } from "zod";

/**
 * One schema per concern, validated lazily: a page that only reads the FAQ must not
 * crash because the admin secret is missing, and `next build` must work without secrets.
 */
function lazyEnv<T extends z.ZodType>(schema: T): () => z.infer<T> {
  let cached: z.infer<T> | undefined;
  return () => {
    cached ??= schema.parse(process.env);
    return cached;
  };
}

export const getDatabaseEnv = lazyEnv(
  z.object({
    DATABASE_URL: z.url(),
  }),
);

export const getAuthEnv = lazyEnv(
  z.object({
    /** Shared password for the protocol team's back-office. */
    ADMIN_PASSWORD: z.string().min(12),
    /** HMAC secret for the admin session cookie. `openssl rand -base64 32` */
    SESSION_SECRET: z.string().min(32),
  }),
);

export const getSeatingEnv = lazyEnv(
  z.object({
    WEDDING_TABLE_COUNT: z.coerce.number().int().positive().default(20),
    WEDDING_TABLE_CAPACITY: z.coerce.number().int().positive().default(10),
  }),
);

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
