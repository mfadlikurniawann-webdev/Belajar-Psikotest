import { LIKERT_OPTIONS } from "./likert";
import type {
  AnswerReview,
  Answers,
  CognitiveCategory,
  CognitiveResult,
  CognitiveTest,
  PersonalityLevel,
  PersonalityResult,
  PersonalityTest,
  Psikotest,
  TestResult,
} from "./types";

const LIKERT_VALUES = new Set<string>(LIKERT_OPTIONS.map((o) => o.value));

export function cognitiveCategory(percent: number): CognitiveCategory {
  if (percent >= 85) return "Sangat Baik";
  if (percent >= 70) return "Baik";
  if (percent >= 55) return "Cukup";
  if (percent >= 40) return "Kurang";
  return "Sangat Kurang";
}

export function personalityLevel(percent: number): PersonalityLevel {
  if (percent < 40) return "rendah";
  if (percent <= 70) return "sedang";
  return "tinggi";
}

/**
 * Hanya menyimpan jawaban untuk soal yang ada di tes dan nilainya valid.
 * Dipakai di server sebelum menyimpan input dari browser.
 */
export function sanitizeAnswers(test: Psikotest, input: unknown): Answers {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;
  const clean: Answers = {};
  for (const q of test.questions) {
    const value = raw[q.id];
    if (typeof value !== "string") continue;
    if (q.type === "likert" ? LIKERT_VALUES.has(value) : q.options.some((o) => o.id === value)) {
      clean[q.id] = value;
    }
  }
  return clean;
}

function scoreCognitive(test: CognitiveTest, answers: Answers): CognitiveResult {
  let correct = 0;
  let answered = 0;
  const sections = new Map<string, { correct: number; total: number }>();

  for (const q of test.questions) {
    const given = answers[q.id];
    const ok = given === q.answer;
    if (given !== undefined) answered++;
    if (ok) correct++;
    if (q.section) {
      const s = sections.get(q.section) ?? { correct: 0, total: 0 };
      s.total++;
      if (ok) s.correct++;
      sections.set(q.section, s);
    }
  }

  const total = test.questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return {
    kind: "cognitive",
    correct,
    total,
    answered,
    percent,
    category: cognitiveCategory(percent),
    sections: [...sections].map(([name, s]) => ({ name, ...s })),
  };
}

function scorePersonality(test: PersonalityTest, answers: Answers): PersonalityResult {
  let answered = 0;
  const sums = new Map<string, { sum: number; count: number }>();

  for (const q of test.questions) {
    const given = answers[q.id];
    // Item yang tidak dijawab diberi nilai tengah (3 / netral).
    let value = 3;
    if (given !== undefined && LIKERT_VALUES.has(given)) {
      value = Number(given);
      answered++;
    }
    const scored = q.reverse ? 6 - value : value;
    const d = sums.get(q.dimension) ?? { sum: 0, count: 0 };
    d.sum += scored;
    d.count++;
    sums.set(q.dimension, d);
  }

  return {
    kind: "personality",
    answered,
    total: test.questions.length,
    dimensions: test.dimensions.map((dim) => {
      const d = sums.get(dim.key);
      const mean = d && d.count > 0 ? d.sum / d.count : 3;
      const percent = Math.round(((mean - 1) / 4) * 100);
      const level = personalityLevel(percent);
      return { key: dim.key, label: dim.label, percent, level, description: dim.descriptions[level] };
    }),
  };
}

export function scoreTest(test: Psikotest, answers: Answers): TestResult {
  return test.kind === "cognitive" ? scoreCognitive(test, answers) : scorePersonality(test, answers);
}

/** Rincian jawaban per soal untuk ditinjau superadmin. */
export function reviewAnswers(test: Psikotest, answers: Answers): AnswerReview[] {
  return test.questions.map((q, i) => {
    const given = answers[q.id] ?? null;
    if (q.type === "likert") {
      const label = LIKERT_OPTIONS.find((o) => o.value === given)?.label ?? null;
      return {
        questionId: q.id,
        number: i + 1,
        prompt: q.reverse ? `${q.prompt} (R)` : q.prompt,
        given,
        givenLabel: label,
        correct: null,
        correctLabel: null,
        isCorrect: null,
      };
    }
    return {
      questionId: q.id,
      number: i + 1,
      prompt: q.prompt,
      compare: q.compare,
      given,
      givenLabel: q.options.find((o) => o.id === given)?.label ?? null,
      correct: q.answer,
      correctLabel: q.options.find((o) => o.id === q.answer)?.label ?? null,
      isCorrect: given === q.answer,
    };
  });
}
