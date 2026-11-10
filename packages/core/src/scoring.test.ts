import { describe, expect, it } from "vitest";
import { getTest, TESTS, toPublicTest } from "./catalog";
import { reviewAnswers, sanitizeAnswers, scoreTest } from "./scoring";
import { summarize } from "./summary";
import type { Answers, CognitiveTest, PersonalityTest } from "./types";

const numerik = getTest("numerik") as CognitiveTest;
const kepribadian = getTest("kepribadian") as PersonalityTest;

function perfectAnswers(test: CognitiveTest): Answers {
  return Object.fromEntries(test.questions.map((q) => [q.id, q.answer]));
}

describe("katalog", () => {
  it("slug dan id soal unik", () => {
    const slugs = TESTS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const t of TESTS) {
      const ids = t.questions.map((q) => q.id);
      expect(new Set(ids).size, t.slug).toBe(ids.length);
    }
  });

  it("setiap soal pilihan ganda punya kunci yang valid", () => {
    for (const t of TESTS) {
      for (const q of t.questions) {
        if (q.type !== "choice") continue;
        expect(
          q.options.some((o) => o.id === q.answer),
          `${t.slug}/${q.id}`,
        ).toBe(true);
      }
    }
  });

  it("posisi jawaban benar tersebar (tidak selalu opsi yang sama)", () => {
    const positions = new Set(numerik.questions.map((q) => q.answer));
    expect(positions.size).toBeGreaterThan(2);
  });

  it("dimensi kepribadian lengkap", () => {
    const keys = new Set(kepribadian.dimensions.map((d) => d.key));
    for (const q of kepribadian.questions) expect(keys.has(q.dimension)).toBe(true);
  });

  it("toPublicTest tidak membocorkan kunci jawaban", () => {
    for (const t of TESTS) {
      const json = JSON.stringify(toPublicTest(t));
      expect(json).not.toContain('"answer"');
      expect(json).not.toContain('"reverse"');
      expect(json).not.toContain('"dimension"');
    }
  });
});

describe("scoreTest - kognitif", () => {
  it("semua benar = 100% Sangat Baik", () => {
    const r = scoreTest(numerik, perfectAnswers(numerik));
    expect(r).toMatchObject({ kind: "cognitive", correct: 20, total: 20, percent: 100, category: "Sangat Baik" });
  });

  it("tanpa jawaban = 0%", () => {
    const r = scoreTest(numerik, {});
    expect(r).toMatchObject({ correct: 0, answered: 0, percent: 0, category: "Sangat Kurang" });
  });

  it("menghitung skor per bagian", () => {
    const r = scoreTest(numerik, perfectAnswers(numerik));
    if (r.kind !== "cognitive") throw new Error("unexpected");
    expect(r.sections).toEqual([
      { name: "Deret Angka", correct: 12, total: 12 },
      { name: "Aritmetika", correct: 8, total: 8 },
    ]);
  });
});

describe("scoreTest - kepribadian", () => {
  it("item terbalik dihitung dengan benar", () => {
    // Jawab 5 untuk item positif & 1 untuk item terbalik => semua dimensi 100%.
    const answers = Object.fromEntries(kepribadian.questions.map((q) => [q.id, q.reverse ? "1" : "5"]));
    const r = scoreTest(kepribadian, answers);
    if (r.kind !== "personality") throw new Error("unexpected");
    expect(r.answered).toBe(20);
    for (const d of r.dimensions) expect(d).toMatchObject({ percent: 100, level: "tinggi" });
  });

  it("tanpa jawaban = netral (50%)", () => {
    const r = scoreTest(kepribadian, {});
    if (r.kind !== "personality") throw new Error("unexpected");
    for (const d of r.dimensions) expect(d).toMatchObject({ percent: 50, level: "sedang" });
  });
});

describe("sanitizeAnswers", () => {
  it("membuang id soal asing dan nilai tidak valid", () => {
    const first = numerik.questions[0];
    if (!first) throw new Error("empty");
    const clean = sanitizeAnswers(numerik, {
      [first.id]: first.answer,
      n02: "z",
      hack: "a",
      n03: 1,
    });
    expect(clean).toEqual({ [first.id]: first.answer });
    expect(sanitizeAnswers(kepribadian, { k01: "5", k02: "6", k03: "0" })).toEqual({ k01: "5" });
    expect(sanitizeAnswers(numerik, null)).toEqual({});
  });
});

describe("reviewAnswers & summarize", () => {
  it("menandai benar/salah", () => {
    const first = numerik.questions[0];
    if (!first) throw new Error("empty");
    const review = reviewAnswers(numerik, { [first.id]: first.answer });
    expect(review[0]?.isCorrect).toBe(true);
    expect(review[1]?.isCorrect).toBe(false);
    expect(review[1]?.given).toBeNull();
  });

  it("allCompleted hanya bila semua tes selesai", () => {
    const partial = summarize({ numerik: scoreTest(numerik, perfectAnswers(numerik)) });
    expect(partial).toMatchObject({ completed: 1, allCompleted: false, cognitiveAverage: 100 });

    const all = Object.fromEntries(TESTS.map((t) => [t.slug, scoreTest(t, {})]));
    expect(summarize(all).allCompleted).toBe(true);
  });
});
