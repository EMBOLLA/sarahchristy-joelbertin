import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import { getDatabaseEnv } from "@/server/env";
import * as schema from "./schema";

/** Driver-agnostic handle: services never know which driver is behind it. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

let instance: Database | null = null;

function isNeonUrl(url: string): boolean {
  return new URL(url).hostname.endsWith(".neon.tech");
}

/**
 * - Neon (prod/preview): HTTP driver — one fetch per query, no TCP pool to exhaust on
 *   serverless, survives scale-to-zero.
 * - Anything else (local Docker Postgres, CI): node-postgres.
 * Constraint that follows: no interactive transactions in services (neon-http has none).
 */
export function getDb(): Database {
  if (instance) return instance;
  const url = getDatabaseEnv().DATABASE_URL;
  instance = isNeonUrl(url)
    ? drizzleNeon({ client: neon(url), schema })
    : drizzlePg({ client: new Pool({ connectionString: url, max: 5 }), schema });
  return instance;
}
