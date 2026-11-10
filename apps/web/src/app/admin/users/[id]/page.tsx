import { reviewAnswers, TESTS } from "@psikotest/core";
import { ArrowLeft, CircleCheck, Hourglass, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OverallCard, TestResultCard } from "@/components/result-view";
import { TestIcon } from "@/components/test-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getParticipant } from "@/lib/admin";
import { type AttemptRow, attemptsBySlug, getUserAttempts, summarizeAttempts } from "@/lib/attempts";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { AnswerReviewTable } from "./answer-review";
import { ResetAttemptButton } from "./reset-button";

export const metadata: Metadata = { title: "Detail Peserta" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminUserDetailPage(props: PageProps<"/admin/users/[id]">) {
  const { id } = await props.params;
  if (!UUID_RE.test(id)) notFound();
  const user = await getParticipant(id);
  if (!user) notFound();

  const rows = await getUserAttempts(user);
  const bySlug = attemptsBySlug(rows);
  const summary = summarizeAttempts(rows);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden /> Daftar peserta
      </Link>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            {user.role === "superadmin" ? <Badge tone="indigo">Superadmin</Badge> : null}
            {summary.allCompleted ? (
              <Badge tone="green">Selesai semua</Badge>
            ) : (
              <Badge tone="amber">
                {summary.completed}/{summary.total} selesai
              </Badge>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" aria-hidden /> {user.email}
            </span>
            <span>{user.emailVerifiedAt ? "Email terverifikasi" : "Email belum diverifikasi"}</span>
            <span>Terdaftar {formatDateTime(user.createdAt)}</span>
          </p>
        </div>
      </Card>

      {summary.completed > 0 ? <OverallCard summary={summary} name={user.name} /> : null}

      <div className="space-y-4">
        {TESTS.map((test) => {
          const attempt = bySlug.get(test.slug);
          if (attempt?.status === "completed" && attempt.result) {
            return (
              <TestResultCard
                key={test.slug}
                test={test}
                result={attempt.result}
                footer={
                  <div className="space-y-4">
                    <AttemptMeta attempt={attempt} userId={user.id} slug={test.slug} />
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-semibold text-indigo-600 select-none hover:text-indigo-500">
                        Lihat jawaban per soal
                      </summary>
                      <AnswerReviewTable rows={reviewAnswers(test, attempt.answers)} kind={test.kind} />
                    </details>
                  </div>
                }
              />
            );
          }
          return (
            <Card key={test.slug} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                <TestIcon slug={test.slug} className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{test.title}</h3>
                {attempt?.status === "in_progress" ? (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-amber-700">
                    <Hourglass className="size-3.5" aria-hidden />
                    Sedang dikerjakan · {Object.keys(attempt.answers).length}/{test.questions.length} terjawab · batas{" "}
                    {formatDateTime(attempt.deadlineAt)}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-slate-500">Belum dikerjakan</p>
                )}
              </div>
              {attempt ? <ResetAttemptButton userId={user.id} slug={test.slug} /> : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AttemptMeta({ attempt, userId, slug }: { attempt: AttemptRow; userId: string; slug: string }) {
  const duration = attempt.completedAt ? attempt.completedAt.getTime() - attempt.startedAt.getTime() : 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <CircleCheck className="size-3.5 text-emerald-500" aria-hidden />
          Selesai {formatDateTime(attempt.completedAt)}
        </span>
        <span>Durasi {formatDuration(duration)}</span>
        {attempt.autoSubmitted ? <Badge tone="amber">Dikumpulkan otomatis (waktu habis)</Badge> : null}
      </p>
      <ResetAttemptButton userId={userId} slug={slug} />
    </div>
  );
}
