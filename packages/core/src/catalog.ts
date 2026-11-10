import { kepribadian } from "./tests/kepribadian";
import { ketelitian } from "./tests/ketelitian";
import { numerik } from "./tests/numerik";
import { penalaran } from "./tests/penalaran";
import { verbal } from "./tests/verbal";
import type { Psikotest, PublicTest } from "./types";

/**
 * Daftar semua psikotes. Untuk menambah tes baru: buat file di ./tests lalu daftarkan di sini.
 * PENTING: jangan mengubah id soal / teks opsi tes yang sudah dipakai peserta,
 * karena jawaban tersimpan berdasarkan id tersebut. Buat slug baru bila perlu revisi besar.
 */
export const TESTS: readonly Psikotest[] = [kepribadian, numerik, verbal, penalaran, ketelitian].sort(
  (a, b) => a.order - b.order,
);

export const TEST_SLUGS = TESTS.map((t) => t.slug);

const bySlug = new Map(TESTS.map((t) => [t.slug, t]));

export function getTest(slug: string): Psikotest | undefined {
  return bySlug.get(slug);
}

/** Versi tes tanpa kunci jawaban, aman dikirim ke client component. */
export function toPublicTest(test: Psikotest): PublicTest {
  return {
    slug: test.slug,
    title: test.title,
    kind: test.kind,
    durationMinutes: test.durationMinutes,
    questions: test.questions.map((q) =>
      q.type === "likert"
        ? { id: q.id, type: "likert", prompt: q.prompt }
        : {
            id: q.id,
            type: "choice",
            prompt: q.prompt,
            compare: q.compare,
            section: q.section,
            options: q.options,
          },
    ),
  };
}
