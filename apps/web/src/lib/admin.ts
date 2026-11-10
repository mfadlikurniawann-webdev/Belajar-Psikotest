import "server-only";
import { TESTS } from "@psikotest/core";
import { and, count, desc, eq, ilike, inArray, or, sql, testAttempts, users } from "@psikotest/db";
import { db } from "@/lib/db";

const SLUGS = TESTS.map((t) => t.slug);
const N = SLUGS.length;
export const PAGE_SIZE = 20;

const completedCount = sql<number>`count(${testAttempts.id}) filter (where ${testAttempts.status} = 'completed')`;
const attemptCount = sql<number>`count(${testAttempts.id})`;
const cognitiveAvg = sql<
  number | null
>`round(avg((${testAttempts.result}->>'percent')::numeric) filter (where ${testAttempts.status} = 'completed' and ${testAttempts.result}->>'kind' = 'cognitive'))`;

export async function getAdminStats() {
  const participantAttempts = and(eq(users.role, "user"), inArray(testAttempts.testSlug, SLUGS));

  const perUser = db
    .select({ userId: testAttempts.userId, done: count().as("done") })
    .from(testAttempts)
    .innerJoin(users, eq(users.id, testAttempts.userId))
    .where(and(participantAttempts, eq(testAttempts.status, "completed")))
    .groupBy(testAttempts.userId)
    .as("per_user");

  const [[participants], [allDone], perTest, recent] = await Promise.all([
    db.select({ n: count() }).from(users).where(eq(users.role, "user")),
    db.select({ n: count() }).from(perUser).where(eq(perUser.done, N)),
    db
      .select({
        slug: testAttempts.testSlug,
        completed: completedCount.mapWith(Number),
        inProgress: sql<number>`count(*) filter (where ${testAttempts.status} = 'in_progress')`.mapWith(Number),
        avg: cognitiveAvg.mapWith(Number),
      })
      .from(testAttempts)
      .innerJoin(users, eq(users.id, testAttempts.userId))
      .where(participantAttempts)
      .groupBy(testAttempts.testSlug),
    db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        slug: testAttempts.testSlug,
        completedAt: testAttempts.completedAt,
      })
      .from(testAttempts)
      .innerJoin(users, eq(users.id, testAttempts.userId))
      .where(and(participantAttempts, eq(testAttempts.status, "completed")))
      .orderBy(desc(testAttempts.completedAt))
      .limit(8),
  ]);

  return {
    participants: participants?.n ?? 0,
    allCompleted: allDone?.n ?? 0,
    inProgress: perTest.reduce((s, t) => s + t.inProgress, 0),
    perTest: new Map(perTest.map((t) => [t.slug, t])),
    recent,
  };
}

export type ParticipantStatus = "all" | "completed" | "in_progress" | "not_started";

export async function listParticipants({ q, status, page }: { q?: string; status: ParticipantStatus; page: number }) {
  const search = q?.trim().slice(0, 100);
  const pattern = search ? `%${search.replace(/[\\%_]/g, (m) => `\\${m}`)}%` : undefined;
  const where = and(
    eq(users.role, "user"),
    pattern ? or(ilike(users.name, pattern), ilike(users.email, pattern)) : undefined,
  );

  const having =
    status === "completed"
      ? sql`${completedCount} = ${N}`
      : status === "in_progress"
        ? sql`${attemptCount} > 0 and ${completedCount} < ${N}`
        : status === "not_started"
          ? sql`${attemptCount} = 0`
          : undefined;

  // Builder Drizzle bersifat mutable, jadi buat instance baru untuk query data & query total.
  const base = () =>
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        emailVerifiedAt: users.emailVerifiedAt,
        completed: completedCount.mapWith(Number).as("completed"),
        started: attemptCount.mapWith(Number).as("started"),
        avg: cognitiveAvg.mapWith(Number).as("avg"),
      })
      .from(users)
      .leftJoin(testAttempts, and(eq(testAttempts.userId, users.id), inArray(testAttempts.testSlug, SLUGS)))
      .where(where)
      .groupBy(users.id)
      .having(having)
      .$dynamic();

  const [rows, [total]] = await Promise.all([
    base()
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(base().as("sq")),
  ]);

  return { rows, total: total?.n ?? 0, totalTests: N };
}

export async function getParticipant(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}

/** Semua peserta + attempt selesai, untuk ekspor CSV. */
export async function getExportRows() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      slug: testAttempts.testSlug,
      result: testAttempts.result,
      completedAt: testAttempts.completedAt,
    })
    .from(users)
    .leftJoin(
      testAttempts,
      and(
        eq(testAttempts.userId, users.id),
        eq(testAttempts.status, "completed"),
        inArray(testAttempts.testSlug, SLUGS),
      ),
    )
    .where(eq(users.role, "user"))
    .orderBy(desc(users.createdAt));
}
