import "server-only";
import { and, authTokens, eq, users } from "@psikotest/db";
import { db } from "@/lib/db";
import { generateToken, hashToken } from "./session";

type TokenType = "email_verification" | "password_reset";

const TTL_MS: Record<TokenType, number> = {
  email_verification: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};

/** Membuat token sekali pakai. Token lama dengan tipe sama untuk user tsb dihapus. */
export async function createAuthToken(userId: string, type: TokenType): Promise<string> {
  const token = generateToken();
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.type, type)));
  await db.insert(authTokens).values({
    userId,
    type,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TTL_MS[type]),
  });
  return token;
}

/** Memakai token (atomic: dihapus saat dibaca). Mengembalikan userId bila valid. */
export async function consumeAuthToken(token: string, type: TokenType): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const [row] = await db
    .delete(authTokens)
    .where(and(eq(authTokens.tokenHash, hashToken(token)), eq(authTokens.type, type)))
    .returning({ userId: authTokens.userId, expiresAt: authTokens.expiresAt });
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row.userId;
}

/** Cek token tanpa memakainya (untuk menampilkan form reset password). */
export async function isAuthTokenValid(token: string, type: TokenType): Promise<boolean> {
  if (!token || token.length > 100) return false;
  const [row] = await db
    .select({ expiresAt: authTokens.expiresAt })
    .from(authTokens)
    .where(and(eq(authTokens.tokenHash, hashToken(token)), eq(authTokens.type, type)))
    .limit(1);
  return !!row && row.expiresAt.getTime() > Date.now();
}

/** Dipakai halaman /verify-email: menandai email terverifikasi bila token valid. */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const userId = await consumeAuthToken(token, "email_verification");
  if (!userId) return false;
  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId));
  return true;
}
