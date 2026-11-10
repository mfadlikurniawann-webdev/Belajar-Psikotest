import { getTest, TESTS } from "@psikotest/core";
import { ArrowRight, CircleCheck, Clock, ListChecks, LockKeyhole, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TestIcon } from "@/components/test-icon";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type AttemptRow, attemptsBySlug, getUserAttempts, summarizeAttempts } from "@/lib/attempts";
import { requireUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { formatDateTime } from "@/lib/utils";
import { VerifyEmailBanner } from "./verify-banner";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const [user, sp] = await Promise.all([requireUser(), props.searchParams]);
  const rows = await getUserAttempts(user);
  const bySlug = attemptsBySlug(rows);
  const summary = summarizeAttempts(rows);
  const doneTest = typeof sp.done === "string" ? getTest(sp.done) : undefined;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Halo, {firstName} 👋</h1>
        <p className="mt-1 text-slate-500">
          Pilih psikotes yang ingin Anda kerjakan. Setiap tes hanya dapat dikerjakan satu kali.
        </p>
      </div>

      <div className="space-y-3">
        {sp.welcome ? <Alert tone="success">Akun berhasil dibuat. Selamat datang!</Alert> : null}
        {doneTest ? (
          <Alert tone="success">
            <strong>{doneTest.title}</strong> berhasil dikumpulkan.
            {summary.allCompleted ? " Semua tes selesai, hasil Anda sudah bisa dilihat!" : null}
          </Alert>
        ) : null}
        {sp.verify === "required" ? (
          <Alert tone="warning">Verifikasi email Anda terlebih dahulu sebelum memulai psikotes.</Alert>
        ) : null}
        {!user.emailVerifiedAt ? (
          <VerifyEmailBanner email={user.email} required={env().REQUIRE_EMAIL_VERIFICATION} />
        ) : null}
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-semibold text-slate-900">Progres psikotes</p>
              <p className="text-sm text-slate-500 tabular-nums">
                {summary.completed}/{summary.total} selesai
              </p>
            </div>
            <Progress value={(summary.completed / summary.total) * 100} className="mt-3 h-3" label="Progres psikotes" />
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              {summary.allCompleted ? (
                <>
                  <Trophy className="size-4 text-amber-500" aria-hidden /> Semua tes selesai. Hasil lengkap sudah
                  tersedia.
                </>
              ) : (
                <>
                  <LockKeyhole className="size-4" aria-hidden /> Hasil akan terbuka setelah semua psikotes selesai
                  dikerjakan.
                </>
              )}
            </p>
          </div>
          {summary.allCompleted ? (
            <Link href="/results" className={buttonClass({ size: "lg" })}>
              Lihat Hasil <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </Card>

      <section aria-labelledby="daftar-tes">
        <h2 id="daftar-tes" className="mb-4 text-lg font-semibold text-slate-900">
          Daftar psikotes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTS.map((test) => (
            <TestCard
              key={test.slug}
              slug={test.slug}
              title={test.title}
              description={test.description}
              duration={test.durationMinutes}
              questions={test.questions.length}
              attempt={bySlug.get(test.slug)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TestCard({
  slug,
  title,
  description,
  duration,
  questions,
  attempt,
}: {
  slug: string;
  title: string;
  description: string;
  duration: number;
  questions: number;
  attempt?: AttemptRow;
}) {
  const status = attempt?.status ?? "new";
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <TestIcon slug={slug} className="size-5" />
        </div>
        {status === "completed" ? (
          <Badge tone="green">
            <CircleCheck className="size-3.5" aria-hidden /> Selesai
          </Badge>
        ) : status === "in_progress" ? (
          <Badge tone="amber">Sedang dikerjakan</Badge>
        ) : (
          <Badge>Belum dikerjakan</Badge>
        )}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden /> {duration} menit
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-3.5" aria-hidden /> {questions} soal
        </span>
      </div>
      <div className="mt-5">
        {status === "completed" ? (
          <p className="text-xs text-slate-500">Dikumpulkan {formatDateTime(attempt?.completedAt)}</p>
        ) : (
          <Link
            href={`/tests/${slug}`}
            className={buttonClass({
              variant: status === "in_progress" ? "primary" : "secondary",
              className: "w-full",
            })}
          >
            {status === "in_progress" ? "Lanjutkan" : "Mulai Tes"} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </Card>
  );
}
