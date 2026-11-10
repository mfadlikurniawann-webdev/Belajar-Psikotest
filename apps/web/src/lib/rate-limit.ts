import "server-only";
import { rateLimits, sql } from "@psikotest/db";
import { db } from "@/lib/db";

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

/**
 * Rate limit fixed-window di Postgres: 1 query upsert per pemanggilan.
 * Cukup untuk melindungi login/registrasi/lupa password tanpa layanan tambahan (Redis).
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const resetAt = new Date(Date.now() + windowSec * 1000);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.resetAt} < now() then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} < now() then excluded.reset_at else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt });

  if (!row) return { ok: true, retryAfterSec: 0 };
  return {
    ok: row.count <= limit,
    retryAfterSec: Math.max(0, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)),
  };
}

export function formatRetry(sec: number): string {
  return sec >= 60 ? `${Math.ceil(sec / 60)} menit` : `${sec} detik`;
}
