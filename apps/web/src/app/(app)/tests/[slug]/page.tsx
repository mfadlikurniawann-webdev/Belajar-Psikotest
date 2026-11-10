import { getTest, toPublicTest } from "@psikotest/core";
import { ArrowLeft, CircleCheck, Clock, ListChecks, Play, TriangleExclamationPoint } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startTestAction } from "@/actions/attempts";
import { SubmitButton } from "@/components/submit-button";
import { TestIcon } from "@/components/test-icon";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserAttempts } from "@/lib/attempts";
import { requireUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { TestRunner } from "./test-runner";

export async function generateMetadata(props: PageProps<"/tests/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: getTest(slug)?.title ?? "Tes" };
}

export default async function TestPage(props: PageProps<"/tests/[slug]">) {
  const { slug } = await props.params;
  const test = getTest(slug);
  if (!test) notFound();

  const user = await requireUser();
  const attempt = (await getUserAttempts(user)).find((a) => a.testSlug === test.slug);

  if (attempt?.status === "in_progress") {
    return (
      <TestRunner
        attemptId={attempt.id}
        test={toPublicTest(test)}
        initialAnswers={attempt.answers}
        deadline={attempt.deadlineAt.getTime()}
        serverNow={Date.now()}
      />
    );
  }

  if (attempt?.status === "completed") {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <CircleCheck className="mx-auto size-12 text-emerald-500" aria-hidden />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{test.title} sudah selesai</h1>
        <p className="mt-2 text-sm text-slate-500">
          Anda sudah mengerjakan tes ini. Hasil akan tersedia setelah semua psikotes selesai.
        </p>
        <Link href="/dashboard" className={buttonClass({ className: "mt-6" })}>
          Kembali ke Dashboard
        </Link>
      </Card>
    );
  }

  const blocked = env().REQUIRE_EMAIL_VERIFICATION && !user.emailVerifiedAt;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden /> Dashboard
      </Link>
      <Card className="mt-4 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <TestIcon slug={test.slug} className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{test.title}</h1>
            <p className="text-sm text-slate-500">{test.description}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <Clock className="size-4 text-slate-400" aria-hidden />
            <p className="mt-2 text-lg font-bold text-slate-900">{test.durationMinutes} menit</p>
            <p className="text-xs text-slate-500">Batas waktu</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <ListChecks className="size-4 text-slate-400" aria-hidden />
            <p className="mt-2 text-lg font-bold text-slate-900">{test.questions.length} soal</p>
            <p className="text-xs text-slate-500">Jumlah soal</p>
          </div>
        </div>

        <h2 className="mt-8 font-semibold text-slate-900">Petunjuk pengerjaan</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600 marker:font-semibold marker:text-indigo-600">
          {test.instructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
          <li>Jawaban tersimpan otomatis. Jika koneksi terputus, Anda dapat melanjutkan selama waktu masih tersisa.</li>
        </ol>

        <div className="mt-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <TriangleExclamationPoint className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            Waktu mulai berjalan saat Anda menekan tombol <strong>Mulai</strong> dan tidak dapat dijeda. Saat waktu
            habis, jawaban dikumpulkan otomatis.
          </p>
        </div>

        <form action={startTestAction} className="mt-6">
          <input type="hidden" name="slug" value={test.slug} />
          <SubmitButton size="lg" className="w-full" disabled={blocked} pendingText="Menyiapkan tes…">
            <Play className="size-4" aria-hidden /> Mulai Tes
          </SubmitButton>
          {blocked ? (
            <p className="mt-2 text-center text-xs text-rose-600">Verifikasi email Anda terlebih dahulu.</p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
