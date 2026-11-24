import type { Locale } from "../config";
import { en } from "./en";
import { fr, type Dictionary } from "./fr";

/**
 * Eager map for contexts without root params (Route Handlers, Server Actions, OG images).
 * Server-side only in practice: never import it from a Client Component (it would ship both languages).
 */
export const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = { fr, en };

export type { Dictionary };
