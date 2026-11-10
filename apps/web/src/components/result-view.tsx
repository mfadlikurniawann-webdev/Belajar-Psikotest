import type { CognitiveCategory, OverallSummary, PersonalityLevel, Psikotest, TestResult } from "@psikotest/core";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestIcon } from "./test-icon";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const categoryTone: Record<CognitiveCategory, "green" | "indigo" | "amber" | "rose"> = {
  "Sangat Baik": "green",
  Baik: "indigo",
  Cukup: "amber",
  Kurang: "rose",
  "Sangat Kurang": "rose",
};

const levelLabel: Record<PersonalityLevel, string> = { rendah: "Rendah", sedang: "Sedang", tinggi: "Tinggi" };
const levelBar: Record<PersonalityLevel, string> = {
  rendah: "bg-sky-500",
  sedang: "bg-indigo-500",
  tinggi: "bg-violet-600",
};

export function OverallCard({ summary, name }: { summary: OverallSummary; name?: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 bg-linear-to-br from-indigo-600 to-violet-600 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/15">
          <Trophy className="size-8" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-100">Ringkasan Hasil{name ? ` · ${name}` : ""}</p>
          <p className="mt-1 text-2xl font-bold sm:text-3xl">
            {summary.cognitiveCategory ? `Kemampuan kognitif: ${summary.cognitiveCategory}` : "Hasil psikotes"}
          </p>
          <p className="mt-1 text-sm text-indigo-100">
            {summary.completed}/{summary.total} tes selesai
            {summary.cognitiveAverage !== null ? ` · Rata-rata skor tes kemampuan ${summary.cognitiveAverage}%` : ""}
          </p>
        </div>
        {summary.cognitiveAverage !== null ? (
          <div className="text-left sm:text-right">
            <p className="text-5xl font-extrabold tabular-nums">{summary.cognitiveAverage}</p>
            <p className="text-xs font-medium tracking-wide text-indigo-100 uppercase">skor rata-rata</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function TestResultCard({
  test,
  result,
  footer,
}: {
  test: Psikotest;
  result: TestResult;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="break-inside-avoid p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <TestIcon slug={test.slug} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{test.title}</h3>
          <p className="text-sm text-slate-500">{test.description}</p>
        </div>
        {result.kind === "cognitive" ? (
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900 tabular-nums">{result.percent}%</p>
            <Badge tone={categoryTone[result.category]}>{result.category}</Badge>
          </div>
        ) : null}
      </div>

      {result.kind === "cognitive" ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm text-slate-600">
            Benar <strong className="text-slate-900">{result.correct}</strong> dari {result.total} soal
            <span className="text-slate-400"> · {result.answered} soal dijawab</span>
          </p>
          {result.sections.length > 1
            ? result.sections.map((s) => {
                const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={s.name}>
                    <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                      <span>{s.name}</span>
                      <span className="tabular-nums">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                    <Progress value={pct} label={s.name} />
                  </div>
                );
              })
            : null}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {result.dimensions.map((d) => (
            <div key={d.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-800">{d.label}</span>
                <span className="flex items-center gap-2">
                  <Badge tone={d.level === "tinggi" ? "indigo" : d.level === "rendah" ? "slate" : "green"}>
                    {levelLabel[d.level]}
                  </Badge>
                  <span className="w-10 text-right text-xs text-slate-500 tabular-nums">{d.percent}%</span>
                </span>
              </div>
              <Progress value={d.percent} barClassName={cn(levelBar[d.level])} label={d.label} />
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{d.description}</p>
            </div>
          ))}
        </div>
      )}
      {footer ? <div className="mt-5 border-t border-slate-100 pt-4">{footer}</div> : null}
    </Card>
  );
}
