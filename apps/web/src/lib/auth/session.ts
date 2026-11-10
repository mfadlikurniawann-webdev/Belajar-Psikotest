import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt, sessions, users } from "@psikotest/db";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

export { safeNext } from "@/lib/redirect";

const isProd = process.env.NODE_ENV === "production";
/** Prefix __Host- memaksa cookie Secure, path=/, tanpa domain (lebih aman). */
export const SESSION_COOKIE = isProd ? "__Host-ps_session" : "ps_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Membuat sesi baru + set cookie. Hanya bisa dipanggil dari Server Action / Route Handler. */
export async function createSession(userId: string): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const h = await headers();

  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
    userAgent: h.get("user-agent")?.slice(0, 255) ?? null,
    ip: await getClientIp(),
  });
  // Bersihkan sesi kedaluwarsa milik user ini (murah, memakai index user_id).
  await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())));

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "superadmin";
  emailVerifiedAt: Date | null;
};

/**
 * User yang sedang login (atau null). Dibungkus React `cache` sehingga dalam satu request
 * hanya ada SATU query ke database walaupun dipanggil dari layout, page, dan komponen.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return row ?? null;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "superadmin") notFound();
  return user;
}
