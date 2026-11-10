"use server";

import { getTest, sanitizeAnswers } from "@psikotest/core";
import { and, eq, testAttempts } from "@psikotest/db";
import { redirect } from "next/navigation";
import { completeAttempt, isExpired } from "@/lib/attempts";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function startTestAction(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get("slug") ?? "");
  const test = getTest(slug);
  if (!test) redirect("/dashboard");

  if (env().REQUIRE_EMAIL_VERIFICATION && !user.emailVerifiedAt) {
    redirect("/dashboard?verify=required");
  }

  const startedAt = new Date();
  await db
    .insert(testAttempts)
    .values({
      userId: user.id,
      testSlug: test.slug,
      startedAt,
      deadlineAt: new Date(startedAt.getTime() + test.durationMinutes * 60_000),
    })
    // Satu attempt per tes per user. Bila sudah ada, cukup lanjutkan yang lama.
    .onConflictDoNothing({ target: [testAttempts.userId, testAttempts.testSlug] });

  redirect(`/tests/${test.slug}`);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadOwnAttempt(userId: string, attemptId: unknown) {
  if (typeof attemptId !== "string" || !UUID_RE.test(attemptId)) return null;
  const [row] = await db
    .select({
      id: testAttempts.id,
      testSlug: testAttempts.testSlug,
      status: testAttempts.status,
      answers: testAttempts.answers,
      deadlineAt: testAttempts.deadlineAt,
    })
    .from(testAttempts)
    .where(and(eq(testAttempts.id, attemptId), eq(testAttempts.userId, userId)))
    .limit(1);
  return row ?? null;
}

export type SaveResult = { ok: true; savedAt: number } | { ok: false; reason: "not_found" | "closed" };

/** Autosave jawaban (dipanggil berkala dari browser). */
export async function saveAnswersAction(attemptId: string, answers: unknown): Promise<SaveResult> {
  const user = await requireUser();
  const attempt = await loadOwnAttempt(user.id, attemptId);
  const test = attempt && getTest(attempt.testSlug);
  if (!attempt || !test) return { ok: false, reason: "not_found" };
  if (attempt.status !== "in_progress" || isExpired(attempt)) return { ok: false, reason: "closed" };

  await db
    .update(testAttempts)
    .set({ answers: sanitizeAnswers(test, answers) })
    .where(and(eq(testAttempts.id, attempt.id), eq(testAttempts.status, "in_progress")));
  return { ok: true, savedAt: Date.now() };
}

export type SubmitResult = { ok: false; error: string };

/** Mengumpulkan tes. Skor dihitung di server; kunci jawaban tidak pernah dikirim ke browser. */
export async function submitTestAction(attemptId: string, answers: unknown, timedOut = false): Promise<SubmitResult> {
  const user = await requireUser();
  const attempt = await loadOwnAttempt(user.id, attemptId);
  const test = attempt && getTest(attempt.testSlug);
  if (!attempt || !test) return { ok: false, error: "Tes tidak ditemukan." };

  if (attempt.status === "in_progress") {
    // Jika terlambat melewati toleransi, pakai jawaban terakhir yang tersimpan di server.
    const late = isExpired(attempt);
    const finalAnswers = late ? attempt.answers : sanitizeAnswers(test, answers);
    // Dikumpulkan otomatis oleh timer browser: dipercaya hanya bila waktu server memang sudah (hampir) habis.
    const auto = late || (timedOut === true && Date.now() >= attempt.deadlineAt.getTime() - 5_000);
    await completeAttempt(user, { ...attempt, answers: finalAnswers }, auto);
  }

  redirect(`/dashboard?done=${encodeURIComponent(test.slug)}`);
}
