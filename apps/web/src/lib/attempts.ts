import "server-only";
import { getTest, scoreTest, summarize, TESTS, type TestResult } from "@psikotest/core";
import { and, eq, inArray, type TestAttempt, testAttempts } from "@psikotest/db";
import { after } from "next/server";
import { db } from "@/lib/db";
import { sendAllCompletedEmails } from "@/lib/mailer";

/** Toleransi keterlambatan jaringan saat submit setelah waktu habis. */
export const GRACE_MS = 30_000;

const TEST_SLUGS = TESTS.map((t) => t.slug);

export type AttemptRow = Pick<
  TestAttempt,
  "id" | "testSlug" | "status" | "answers" | "result" | "startedAt" | "deadlineAt" | "completedAt" | "autoSubmitted"
>;

const attemptColumns = {
  id: testAttempts.id,
  testSlug: testAttempts.testSlug,
  status: testAttempts.status,
  answers: testAttempts.answers,
  result: testAttempts.result,
  startedAt: testAttempts.startedAt,
  deadlineAt: testAttempts.deadlineAt,
  completedAt: testAttempts.completedAt,
  autoSubmitted: testAttempts.autoSubmitted,
};

export function isExpired(attempt: Pick<AttemptRow, "deadlineAt">, now = Date.now()): boolean {
  return attempt.deadlineAt.getTime() + GRACE_MS < now;
}

/**
 * Menyelesaikan attempt (skor dihitung di server). Kondisi `status = in_progress` menjamin
 * attempt hanya bisa diselesaikan sekali walaupun ada double-submit.
 * Mengembalikan baris yang diperbarui, atau null bila sudah selesai sebelumnya.
 */
export async function completeAttempt(
  user: { id: string; name: string; email: string },
  attempt: Pick<AttemptRow, "id" | "testSlug" | "answers" | "deadlineAt">,
  auto: boolean,
): Promise<AttemptRow | null> {
  const test = getTest(attempt.testSlug);
  if (!test) return null;
  const result = scoreTest(test, attempt.answers);
  const completedAt = auto ? attempt.deadlineAt : new Date();

  const [row] = await db
    .update(testAttempts)
    .set({ status: "completed", answers: attempt.answers, result, completedAt, autoSubmitted: auto })
    .where(
      and(eq(testAttempts.id, attempt.id), eq(testAttempts.userId, user.id), eq(testAttempts.status, "in_progress")),
    )
    .returning(attemptColumns);

  if (row) await notifyIfAllCompleted(user);
  return row ?? null;
}

async function notifyIfAllCompleted(user: { id: string; name: string; email: string }) {
  const done = await db
    .select({ slug: testAttempts.testSlug })
    .from(testAttempts)
    .where(
      and(
        eq(testAttempts.userId, user.id),
        eq(testAttempts.status, "completed"),
        inArray(testAttempts.testSlug, TEST_SLUGS),
      ),
    );
  if (done.length === TEST_SLUGS.length) {
    // Kirim email SETELAH response terkirim agar peserta tidak menunggu.
    after(() => sendAllCompletedEmails(user));
  }
}

/**
 * Semua attempt milik user (1 query). Attempt yang waktunya sudah habis otomatis
 * diselesaikan dengan jawaban terakhir yang tersimpan (lazy finalization, tanpa cron).
 */
export async function getUserAttempts(user: { id: string; name: string; email: string }): Promise<AttemptRow[]> {
  const rows = await db.select(attemptColumns).from(testAttempts).where(eq(testAttempts.userId, user.id));

  const now = Date.now();
  const out: AttemptRow[] = [];
  // Berurutan (bukan paralel) agar notifikasi "semua selesai" tidak terkirim ganda.
  for (const row of rows) {
    if (row.status === "in_progress" && isExpired(row, now)) {
      out.push((await completeAttempt(user, row, true)) ?? { ...row, status: "completed" });
    } else {
      out.push(row);
    }
  }
  return out;
}

export function attemptsBySlug(rows: AttemptRow[]): Map<string, AttemptRow> {
  return new Map(rows.map((r) => [r.testSlug, r]));
}

export function summarizeAttempts(rows: AttemptRow[]) {
  const results: Record<string, TestResult | null> = {};
  for (const r of rows) if (r.status === "completed") results[r.testSlug] = r.result;
  return summarize(results);
}
