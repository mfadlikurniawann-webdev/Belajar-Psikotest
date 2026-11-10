import { TESTS } from "./catalog";
import { cognitiveCategory } from "./scoring";
import type { CognitiveCategory, TestResult } from "./types";

export interface OverallSummary {
  completed: number;
  total: number;
  allCompleted: boolean;
  /** Rata-rata persentase tes kognitif yang sudah selesai (null bila belum ada). */
  cognitiveAverage: number | null;
  cognitiveCategory: CognitiveCategory | null;
}

/** Ringkasan keseluruhan berdasarkan hasil per slug tes (hanya yang sudah selesai). */
export function summarize(results: Record<string, TestResult | null | undefined>): OverallSummary {
  let completed = 0;
  const cognitive: number[] = [];
  for (const test of TESTS) {
    const r = results[test.slug];
    if (!r) continue;
    completed++;
    if (r.kind === "cognitive") cognitive.push(r.percent);
  }
  const avg = cognitive.length > 0 ? Math.round(cognitive.reduce((a, b) => a + b, 0) / cognitive.length) : null;
  return {
    completed,
    total: TESTS.length,
    allCompleted: completed === TESTS.length,
    cognitiveAverage: avg,
    cognitiveCategory: avg === null ? null : cognitiveCategory(avg),
  };
}
