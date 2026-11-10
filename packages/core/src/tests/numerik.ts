import { choice } from "../builders";
import type { CognitiveTest } from "../types";

const DERET = "Deret Angka";
const HITUNG = "Aritmetika";

export const numerik: CognitiveTest = {
  slug: "numerik",
  kind: "cognitive",
  order: 2,
  title: "Tes Kemampuan Numerik",
  description: "Mengukur kemampuan mengenali pola deret angka dan menyelesaikan soal hitungan.",
  durationMinutes: 15,
  instructions: [
    "Bagian Deret Angka: tentukan bilangan berikutnya yang paling tepat melanjutkan pola.",
    "Bagian Aritmetika: selesaikan soal hitungan tanpa kalkulator.",
    "Setiap soal hanya memiliki satu jawaban benar. Tidak ada pengurangan nilai untuk jawaban salah.",
  ],
  questions: [
    choice({ id: "n01", section: DERET, prompt: "2, 4, 6, 8, …", correct: "10", distractors: ["9", "12", "14"] }),
    choice({ id: "n02", section: DERET, prompt: "3, 6, 12, 24, …", correct: "48", distractors: ["36", "42", "30"] }),
    choice({ id: "n03", section: DERET, prompt: "1, 4, 9, 16, 25, …", correct: "36", distractors: ["30", "34", "49"] }),
    choice({ id: "n04", section: DERET, prompt: "100, 90, 81, 73, …", correct: "66", distractors: ["64", "65", "67"] }),
    choice({ id: "n05", section: DERET, prompt: "2, 3, 5, 8, 13, …", correct: "21", distractors: ["18", "20", "26"] }),
    choice({
      id: "n06",
      section: DERET,
      prompt: "1, 2, 6, 24, 120, …",
      correct: "720",
      distractors: ["240", "600", "840"],
    }),
    choice({
      id: "n07",
      section: DERET,
      prompt: "4, 7, 13, 25, 49, …",
      correct: "97",
      distractors: ["73", "96", "98"],
    }),
    choice({ id: "n08", section: DERET, prompt: "2, 5, 4, 7, 6, 9, …", correct: "8", distractors: ["10", "11", "12"] }),
    choice({ id: "n09", section: DERET, prompt: "81, 27, 9, 3, …", correct: "1", distractors: ["0", "2", "1/9"] }),
    choice({ id: "n10", section: DERET, prompt: "1, 3, 7, 15, 31, …", correct: "63", distractors: ["47", "62", "64"] }),
    choice({
      id: "n11",
      section: DERET,
      prompt: "10, 12, 15, 19, 24, …",
      correct: "30",
      distractors: ["28", "29", "31"],
    }),
    choice({
      id: "n12",
      section: DERET,
      prompt: "20, 18, 22, 20, 24, …",
      correct: "22",
      distractors: ["18", "26", "28"],
    }),
    choice({
      id: "n13",
      section: HITUNG,
      prompt: "25% dari 240 adalah …",
      correct: "60",
      distractors: ["48", "64", "72"],
    }),
    choice({
      id: "n14",
      section: HITUNG,
      prompt: "Sebuah baju seharga Rp200.000 mendapat diskon 15%. Berapa harga setelah diskon?",
      correct: "Rp170.000",
      distractors: ["Rp175.000", "Rp180.000", "Rp185.000"],
    }),
    choice({
      id: "n15",
      section: HITUNG,
      prompt: "3/4 + 2/3 = …",
      correct: "17/12",
      distractors: ["5/7", "5/12", "6/7"],
    }),
    choice({
      id: "n16",
      section: HITUNG,
      prompt:
        "5 orang pekerja dapat menyelesaikan sebuah pekerjaan dalam 12 hari. Jika dikerjakan 6 orang dengan kecepatan yang sama, berapa hari yang dibutuhkan?",
      correct: "10 hari",
      distractors: ["8 hari", "12 hari", "14 hari"],
    }),
    choice({
      id: "n17",
      section: HITUNG,
      prompt: "Sebuah mobil menempuh 180 km dalam 2 jam 30 menit. Berapa kecepatan rata-ratanya?",
      correct: "72 km/jam",
      distractors: ["60 km/jam", "70 km/jam", "90 km/jam"],
    }),
    choice({
      id: "n18",
      section: HITUNG,
      prompt: "0,25 × 0,4 = …",
      correct: "0,1",
      distractors: ["0,01", "1", "0,001"],
    }),
    choice({
      id: "n19",
      section: HITUNG,
      prompt:
        "Rata-rata 4 bilangan adalah 15. Setelah ditambah satu bilangan lagi, rata-ratanya menjadi 16. Berapa bilangan yang ditambahkan?",
      correct: "20",
      distractors: ["16", "18", "21"],
    }),
    choice({ id: "n20", section: HITUNG, prompt: "√144 + 3² = …", correct: "21", distractors: ["15", "18", "24"] }),
  ],
};
