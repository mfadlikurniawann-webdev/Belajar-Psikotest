import { getTest, TESTS } from "@psikotest/core";
import { ArrowRight, CircleCheck, Download, Hourglass, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TestIcon } from "@/components/test-icon";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAdminStats } from "@/lib/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Ringkasan" };

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total peserta", value: stats.participants, icon: Users, tone: "bg-indigo-50 text-indigo-600" },
    {
      label: "Selesai semua tes",
      value: stats.allCompleted,
      icon: CircleCheck,
      tone: "bg-emerald-50 text-emerald-600",
    },
    { label: "Tes sedang berjalan", value: stats.inProgress, icon: Hourglass, tone: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard Superadmin</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau progres dan hasil psikotes seluruh peserta.</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/export" className={buttonClass({ variant: "secondary" })}>
            <Download className="size-4" aria-hidden /> Ekspor CSV
          </a>
          <Link href="/admin/users" className={buttonClass()}>
            Lihat Peserta <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="flex items-center gap-4 p-5">
            <div className={`grid size-12 place-items-center rounded-xl ${c.tone}`}>
              <c.icon className="size-6" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{c.value}</p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h2 className="font-semibold text-slate-900">Statistik per tes</h2>
          <ul className="mt-4 space-y-5">
            {TESTS.map((t) => {
              const s = stats.perTest.get(t.slug);
              const completed = s?.completed ?? 0;
              const pct = stats.participants ? (completed / stats.participants) * 100 : 0;
              return (
                <li key={t.slug}>
                  <div className="flex items-center gap-3">
                    <TestIcon slug={t.slug} className="size-4 text-indigo-600" />
                    <span className="flex-1 text-sm font-medium text-slate-800">{t.title}</span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {completed} selesai
                      {s?.inProgress ? ` · ${s.inProgress} berjalan` : ""}
                      {t.kind === "cognitive" && s?.avg != null ? ` · rata-rata ${s.avg}%` : ""}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2" label={`Penyelesaian ${t.title}`} />
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Aktivitas terbaru</h2>
          {stats.recent.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Belum ada tes yang diselesaikan.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {stats.recent.map((r) => (
                <li key={`${r.userId}-${r.slug}`} className="py-3">
                  <Link href={`/admin/users/${r.userId}`} className="group block">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600">{r.name}</p>
                    <p className="text-xs text-slate-500">
                      {getTest(r.slug)?.title ?? r.slug} · {formatDateTime(r.completedAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
