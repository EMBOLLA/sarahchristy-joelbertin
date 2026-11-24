import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { getServerEnv } from "@/server/env";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let instance: Database | null = null;

/**
 * HTTP driver: one fetch per query, no TCP pool to exhaust on serverless,
 * and it survives Neon's scale-to-zero transparently.
 */
export function getDb(): Database {
  instance ??= drizzle({ client: neon(getServerEnv().DATABASE_URL), schema });
  return instance;
}
