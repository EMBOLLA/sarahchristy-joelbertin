"use client";

import { useSyncExternalStore } from "react";

/** Last ticket generated on this device — lets a guest re-download without refilling the form. */
export type RememberedTicket = Readonly<{ publicCode: string; names: string[] }>;

const STORAGE_KEY = "wedding:ticket";
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // private mode / blocked storage
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function parse(raw: string | null): RememberedTicket | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "publicCode" in value &&
      typeof value.publicCode === "string" &&
      "names" in value &&
      Array.isArray(value.names) &&
      value.names.every((n): n is string => typeof n === "string")
    ) {
      return { publicCode: value.publicCode, names: value.names };
    }
  } catch {
    // corrupted entry → ignore
  }
  return null;
}

export function rememberTicket(ticket: RememberedTicket): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ticket));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
}

export function useRememberedTicket(): RememberedTicket | null {
  // Snapshot is the raw string (stable primitive); parsing happens after.
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return parse(raw);
}

export function ticketPdfUrl(publicCode: string): string {
  return `/api/tickets/${encodeURIComponent(publicCode)}/pdf`;
}
