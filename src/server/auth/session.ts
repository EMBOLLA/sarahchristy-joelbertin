import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getAuthEnv } from "@/server/env";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const AUDIENCE = "wedding-backoffice";

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getAuthEnv().SESSION_SECRET);
}

/** Hash both sides first: timingSafeEqual requires equal lengths and must not leak the length. */
export function isValidAdminPassword(candidate: string): boolean {
  const digest = (value: string): Buffer => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(candidate), digest(getAuthEnv().ADMIN_PASSWORD));
}

export async function openAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function closeAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { audience: AUDIENCE, algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** Guard for every Server Action and Route Handler of the back-office. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new UnauthorizedError();
}
