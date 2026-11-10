import type { AnswerReview } from "@psikotest/core";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnswerReviewTable({ rows, kind }: { rows: AnswerReview[]; kind: "cognitive" | "personality" }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 font-semibold text-slate-500">
          <tr>
            <th className="w-10 px-3 py-2">#</th>
            <th className="px-3 py-2">Soal</th>
            <th className="px-3 py-2 whitespace-nowrap">Jawaban peserta</th>
            {kind === "cognitive" ? <th className="px-3 py-2 whitespace-nowrap">Kunci</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.questionId} className={cn(r.isCorrect === false && "bg-rose-50/40")}>
              <td className="px-3 py-2 text-slate-400 tabular-nums">{r.number}</td>
              <td className="px-3 py-2 text-slate-700">
                {r.prompt}
                {r.compare ? (
                  <span className="mt-0.5 block font-mono text-slate-500">
                    {r.compare[0]} | {r.compare[1]}
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5">
                  {r.isCorrect === true ? <Check className="size-3.5 text-emerald-600" aria-label="Benar" /> : null}
                  {r.isCorrect === false ? <X className="size-3.5 text-rose-600" aria-label="Salah" /> : null}
                  {r.givenLabel ?? <span className="text-slate-400 italic">tidak dijawab</span>}
                </span>
              </td>
              {kind === "cognitive" ? <td className="px-3 py-2 text-slate-700">{r.correctLabel}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
