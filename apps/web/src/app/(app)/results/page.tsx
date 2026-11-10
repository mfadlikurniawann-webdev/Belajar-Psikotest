import { TESTS } from "@psikotest/core";
import { CircleCheck, CircleDashed, LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OverallCard, TestResultCard } from "@/components/result-view";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { attemptsBySlug, getUserAttempts, summarizeAttempts } from "@/lib/attempts";
import { requireUser } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Hasil Psikotes" };

export default async function ResultsPage() {
  const user = await requireUser();
  const rows = await getUserAttempts(user);
  const bySlug = attemptsBySlug(rows);
  const summary = summarizeAttempts(rows);

  if (!summary.allCompleted) {
    return (
      <Card className="mx-auto max-w-xl p-8">
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <LockKeyhole className="size-7" aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Hasil masih terkunci</h1>
          <p className="mt-2 text-sm text-slate-500">
            Hasil psikotes akan terbuka setelah Anda menyelesaikan <strong>semua</strong> tes.
          </p>
        </div>
        <Progress value={(summary.completed / summary.total) * 100} className="mt-6 h-3" label="Progres" />
        <p className="mt-2 text-center text-sm text-slate-500 tabular-nums">
          {summary.completed}/{summary.total} tes selesai
        </p>
        <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {TESTS.map((t) => {
            const done = bySlug.get(t.slug)?.status === "completed";
            return (
              <li key={t.slug} className="flex items-center gap-3 px-4 py-3 text-sm">
                {done ? (
                  <CircleCheck className="size-5 text-emerald-500" aria-label="Selesai" />
                ) : (
                  <CircleDashed className="size-5 text-slate-300" aria-label="Belum" />
                )}
                <span className={done ? "text-slate-500" : "font-medium text-slate-900"}>{t.title}</span>
              </li>
            );
          })}
        </ul>
        <Link href="/dashboard" className={buttonClass({ className: "mt-6 w-full", size: "lg" })}>
          Lanjutkan Psikotes
        </Link>
      </Card>
    );
  }

  const lastCompleted = rows.reduce<Date | null>(
    (max, r) => (r.completedAt && (!max || r.completedAt > max) ? r.completedAt : max),
    null,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Hasil Psikotes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.name} · Selesai {formatDateTime(lastCompleted)}
          </p>
        </div>
        <PrintButton />
      </div>
      <OverallCard summary={summary} />
      <div className="grid gap-4 lg:grid-cols-2 print:block print:space-y-4">
        {TESTS.map((test) => {
          const result = bySlug.get(test.slug)?.result;
          return result ? <TestResultCard key={test.slug} test={test} result={result} /> : null;
        })}
      </div>
      <p className="text-xs leading-relaxed text-slate-400">
        Catatan: hasil ini bersifat latihan dan bukan diagnosis psikologis. Untuk asesmen resmi, konsultasikan dengan
        psikolog berlisensi.
      </p>
    </div>
  );
}
