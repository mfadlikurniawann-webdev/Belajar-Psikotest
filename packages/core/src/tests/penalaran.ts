import { choice } from "../builders";
import type { CognitiveTest } from "../types";

const SILOGISME = "Silogisme";
const ANALITIS = "Penalaran Analitis";

export const penalaran: CognitiveTest = {
  slug: "penalaran-logis",
  kind: "cognitive",
  order: 4,
  title: "Tes Penalaran Logis",
  description: "Mengukur kemampuan menarik kesimpulan yang sahih dan memecahkan masalah secara analitis.",
  durationMinutes: 12,
  instructions: [
    "Anggap semua pernyataan (premis) benar, meskipun terasa tidak sesuai dengan kenyataan sehari-hari.",
    "Pilih kesimpulan yang PASTI benar berdasarkan premis yang diberikan.",
    "Untuk soal analitis, gunakan informasi yang tersedia saja.",
  ],
  questions: [
    choice({
      id: "p01",
      section: SILOGISME,
      prompt: "Semua mamalia bernapas dengan paru-paru. Paus adalah mamalia. Kesimpulannya …",
      correct: "Paus bernapas dengan paru-paru.",
      distractors: [
        "Paus bukan hewan laut.",
        "Sebagian mamalia tidak bernapas dengan paru-paru.",
        "Tidak dapat disimpulkan.",
      ],
    }),
    choice({
      id: "p02",
      section: SILOGISME,
      prompt: "Semua karyawan yang disiplin mendapat bonus. Andi tidak mendapat bonus. Kesimpulannya …",
      correct: "Andi bukan karyawan yang disiplin.",
      distractors: ["Andi karyawan yang disiplin.", "Andi bukan karyawan.", "Tidak dapat disimpulkan."],
    }),
    choice({
      id: "p03",
      section: SILOGISME,
      prompt: "Jika hari hujan, jalanan basah. Jalanan tidak basah. Kesimpulannya …",
      correct: "Hari tidak hujan.",
      distractors: ["Hari hujan.", "Jalanan kering karena panas.", "Tidak dapat disimpulkan."],
    }),
    choice({
      id: "p04",
      section: SILOGISME,
      prompt: "Jika hari hujan, jalanan basah. Jalanan basah. Kesimpulannya …",
      correct: "Tidak dapat disimpulkan dengan pasti.",
      distractors: ["Hari hujan.", "Hari tidak hujan.", "Pasti ada yang menyiram jalan."],
    }),
    choice({
      id: "p05",
      section: SILOGISME,
      prompt: "Sebagian siswa suka matematika. Semua yang suka matematika suka fisika. Kesimpulannya …",
      correct: "Sebagian siswa suka fisika.",
      distractors: [
        "Semua siswa suka fisika.",
        "Tidak ada siswa yang suka fisika.",
        "Semua yang suka fisika adalah siswa.",
      ],
    }),
    choice({
      id: "p06",
      section: SILOGISME,
      prompt: "Tidak ada kucing yang bisa terbang. Semua burung bisa terbang. Kesimpulannya …",
      correct: "Tidak ada kucing yang merupakan burung.",
      distractors: [
        "Sebagian kucing adalah burung.",
        "Sebagian burung tidak bisa terbang.",
        "Tidak dapat disimpulkan.",
      ],
    }),
    choice({
      id: "p07",
      section: SILOGISME,
      prompt: "Semua A adalah B. Semua B adalah C. Kesimpulannya …",
      correct: "Semua A adalah C.",
      distractors: ["Semua C adalah A.", "Sebagian C bukan B.", "Tidak ada A yang merupakan C."],
    }),
    choice({
      id: "p08",
      section: ANALITIS,
      prompt:
        "Rina lebih tinggi dari Sari. Sari lebih tinggi dari Tono. Dewi lebih pendek dari Tono. Siapa yang paling pendek?",
      correct: "Dewi",
      distractors: ["Rina", "Sari", "Tono"],
    }),
    choice({
      id: "p09",
      section: ANALITIS,
      prompt: "A lebih tua dari B. C lebih muda dari B. D lebih tua dari A. Urutan dari yang paling tua adalah …",
      correct: "D, A, B, C",
      distractors: ["A, D, B, C", "D, B, A, C", "A, B, D, C"],
    }),
    choice({
      id: "p10",
      section: ANALITIS,
      prompt:
        "Dalam sebuah antrean, Budi berada di urutan ke-7 dari depan dan ke-12 dari belakang. Berapa jumlah orang dalam antrean?",
      correct: "18",
      distractors: ["17", "19", "20"],
    }),
    choice({
      id: "p11",
      section: ANALITIS,
      prompt: "Hari ini hari Rabu. 100 hari lagi adalah hari …",
      correct: "Jumat",
      distractors: ["Kamis", "Sabtu", "Minggu"],
    }),
    choice({
      id: "p12",
      section: ANALITIS,
      prompt: "Jika KUDA dikodekan menjadi LVEB, maka SAPI dikodekan menjadi …",
      correct: "TBQJ",
      distractors: ["TBPJ", "RBQJ", "TCQJ"],
    }),
    choice({
      id: "p13",
      section: ANALITIS,
      prompt: "X > Y dan Y > Z. Jika X = 9 dan Z = 5, nilai Y yang mungkin adalah …",
      correct: "7",
      distractors: ["4", "5", "10"],
    }),
    choice({
      id: "p14",
      section: ANALITIS,
      prompt:
        "Sebuah kotak berisi 5 bola merah dan 3 bola biru. Minimal berapa bola yang harus diambil tanpa melihat agar PASTI mendapat 2 bola merah?",
      correct: "5",
      distractors: ["2", "3", "4"],
    }),
    choice({
      id: "p15",
      section: ANALITIS,
      prompt: "Berapa besar sudut terkecil antara jarum jam dan jarum menit pada pukul 03.30?",
      correct: "75°",
      distractors: ["60°", "90°", "105°"],
    }),
  ],
};
