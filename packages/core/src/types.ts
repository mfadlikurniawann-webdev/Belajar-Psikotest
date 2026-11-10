/** Jawaban peserta: questionId -> optionId (pilihan ganda) atau "1".."5" (skala Likert). */
export type Answers = Record<string, string>;

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface ChoiceQuestion {
  id: string;
  type: "choice";
  prompt: string;
  /** Dua data yang dibandingkan (khusus tes ketelitian). */
  compare?: [string, string];
  section?: string;
  options: ChoiceOption[];
  /** Kunci jawaban (option id). Hanya boleh ada di server. */
  answer: string;
}

export interface LikertQuestion {
  id: string;
  type: "likert";
  prompt: string;
  dimension: string;
  /** Item terbalik (reverse-keyed): skor = 6 - jawaban. */
  reverse?: boolean;
}

export type Question = ChoiceQuestion | LikertQuestion;

export interface DimensionInfo {
  key: string;
  label: string;
  descriptions: Record<PersonalityLevel, string>;
}

interface TestBase {
  slug: string;
  title: string;
  description: string;
  instructions: string[];
  durationMinutes: number;
  /** Urutan tampil di dashboard. */
  order: number;
}

export interface CognitiveTest extends TestBase {
  kind: "cognitive";
  questions: ChoiceQuestion[];
}

export interface PersonalityTest extends TestBase {
  kind: "personality";
  dimensions: DimensionInfo[];
  questions: LikertQuestion[];
}

export type Psikotest = CognitiveTest | PersonalityTest;

/* ---------- Bentuk aman untuk dikirim ke browser (tanpa kunci jawaban) ---------- */

export type PublicQuestion =
  | {
      id: string;
      type: "choice";
      prompt: string;
      compare?: [string, string];
      section?: string;
      options: ChoiceOption[];
    }
  | { id: string; type: "likert"; prompt: string };

export interface PublicTest {
  slug: string;
  title: string;
  kind: Psikotest["kind"];
  durationMinutes: number;
  questions: PublicQuestion[];
}

/* ---------- Hasil ---------- */

export type CognitiveCategory = "Sangat Baik" | "Baik" | "Cukup" | "Kurang" | "Sangat Kurang";
export type PersonalityLevel = "rendah" | "sedang" | "tinggi";

export interface SectionScore {
  name: string;
  correct: number;
  total: number;
}

export interface CognitiveResult {
  kind: "cognitive";
  correct: number;
  total: number;
  answered: number;
  percent: number;
  category: CognitiveCategory;
  sections: SectionScore[];
}

export interface DimensionScore {
  key: string;
  label: string;
  /** 0-100 */
  percent: number;
  level: PersonalityLevel;
  description: string;
}

export interface PersonalityResult {
  kind: "personality";
  answered: number;
  total: number;
  dimensions: DimensionScore[];
}

export type TestResult = CognitiveResult | PersonalityResult;

export interface AnswerReview {
  questionId: string;
  number: number;
  prompt: string;
  compare?: [string, string];
  given: string | null;
  givenLabel: string | null;
  correct: string | null;
  correctLabel: string | null;
  isCorrect: boolean | null;
}
