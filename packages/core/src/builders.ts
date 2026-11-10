import type { ChoiceQuestion, LikertQuestion } from "./types";

const OPTION_IDS = ["a", "b", "c", "d", "e", "f"] as const;

/** FNV-1a 32-bit hash: stabil & cepat untuk seed acak deterministik. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** PRNG mulberry32. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  const rand = rng(hash(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

interface ChoiceInput {
  id: string;
  prompt: string;
  correct: string;
  distractors: string[];
  section?: string;
}

/**
 * Membuat soal pilihan ganda. Urutan opsi diacak secara deterministik (berdasarkan id soal)
 * supaya posisi jawaban benar tidak selalu sama, dan id opsi diberikan SETELAH diacak
 * sehingga id tidak membocorkan jawaban.
 */
export function choice({ id, prompt, correct, distractors, section }: ChoiceInput): ChoiceQuestion {
  const labels = seededShuffle([correct, ...distractors], id);
  if (new Set(labels).size !== labels.length) {
    throw new Error(`Opsi duplikat pada soal ${id}`);
  }
  const options = labels.map((label, i) => ({ id: OPTION_IDS[i] as string, label }));
  const answer = options.find((o) => o.label === correct)?.id;
  if (!answer) throw new Error(`Jawaban tidak ditemukan pada soal ${id}`);
  return { id, type: "choice", prompt, section, options, answer };
}

/** Soal ketelitian: bandingkan dua data, opsi tetap "Sama" / "Berbeda". */
export function compare(id: string, left: string, right: string): ChoiceQuestion {
  return {
    id,
    type: "choice",
    prompt: "Apakah kedua data berikut sama persis?",
    compare: [left, right],
    options: [
      { id: "a", label: "Sama" },
      { id: "b", label: "Berbeda" },
    ],
    answer: left === right ? "a" : "b",
  };
}

export function likert(id: string, dimension: string, prompt: string, reverse = false): LikertQuestion {
  return { id, type: "likert", dimension, prompt, reverse };
}
