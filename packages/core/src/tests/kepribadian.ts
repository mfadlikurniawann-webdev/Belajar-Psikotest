import { likert } from "../builders";
import type { PersonalityTest } from "../types";

/**
 * Tes kepribadian Big Five, diadaptasi dari Mini-IPIP (Donnellan dkk., 2006).
 * Item IPIP berstatus public domain (https://ipip.ori.org).
 */
export const kepribadian: PersonalityTest = {
  slug: "kepribadian",
  kind: "personality",
  order: 1,
  title: "Tes Kepribadian (Big Five)",
  description:
    "Mengukur lima dimensi kepribadian: ekstraversi, keramahan, ketelitian kerja, stabilitas emosi, dan keterbukaan.",
  durationMinutes: 10,
  instructions: [
    "Tidak ada jawaban benar atau salah. Jawablah sesuai diri Anda yang sebenarnya, bukan yang Anda harapkan.",
    "Pilih tingkat kesesuaian pernyataan dengan diri Anda, dari 'Sangat Tidak Sesuai' hingga 'Sangat Sesuai'.",
    "Jangan terlalu lama memikirkan satu pernyataan; jawaban spontan biasanya paling akurat.",
  ],
  dimensions: [
    {
      key: "ekstraversi",
      label: "Ekstraversi",
      descriptions: {
        rendah: "Cenderung tenang, reflektif, dan nyaman bekerja mandiri. Energi diperoleh dari waktu sendiri.",
        sedang: "Fleksibel antara bersosialisasi dan bekerja sendiri, menyesuaikan dengan situasi.",
        tinggi:
          "Energik, mudah bergaul, dan nyaman menjadi pusat perhatian. Cocok untuk peran yang banyak berinteraksi.",
      },
    },
    {
      key: "keramahan",
      label: "Keramahan",
      descriptions: {
        rendah: "Lugas, kritis, dan objektif; lebih mengutamakan logika daripada perasaan.",
        sedang: "Mampu peduli pada orang lain sambil tetap menjaga ketegasan.",
        tinggi: "Empatik, kooperatif, dan peduli; mudah membangun kepercayaan dalam tim.",
      },
    },
    {
      key: "ketelitian",
      label: "Ketelitian Kerja",
      descriptions: {
        rendah: "Spontan dan fleksibel, namun perlu melatih keteraturan dan konsistensi.",
        sedang: "Cukup terorganisasi, dapat menyeimbangkan rencana dan improvisasi.",
        tinggi: "Teratur, disiplin, dan dapat diandalkan dalam menyelesaikan tugas.",
      },
    },
    {
      key: "stabilitas_emosi",
      label: "Stabilitas Emosi",
      descriptions: {
        rendah: "Peka terhadap tekanan; perlu strategi pengelolaan stres yang baik.",
        sedang: "Umumnya tenang, namun kadang terpengaruh situasi yang menekan.",
        tinggi: "Tenang, tahan tekanan, dan tidak mudah terbawa emosi negatif.",
      },
    },
    {
      key: "keterbukaan",
      label: "Keterbukaan",
      descriptions: {
        rendah: "Praktis dan menyukai cara-cara yang sudah terbukti.",
        sedang: "Terbuka pada ide baru selama relevan dan bermanfaat.",
        tinggi: "Imajinatif, kreatif, dan senang mengeksplorasi gagasan abstrak.",
      },
    },
  ],
  questions: [
    likert("k01", "ekstraversi", "Saya menjadi penghidup suasana dalam acara kumpul-kumpul."),
    likert("k02", "keramahan", "Saya bersimpati terhadap perasaan orang lain."),
    likert("k03", "ketelitian", "Saya segera menyelesaikan tugas-tugas rutin."),
    likert("k04", "stabilitas_emosi", "Suasana hati saya sering berubah-ubah.", true),
    likert("k05", "keterbukaan", "Saya memiliki imajinasi yang kaya."),
    likert("k06", "ekstraversi", "Saya tidak banyak bicara.", true),
    likert("k07", "keramahan", "Saya tidak tertarik dengan masalah orang lain.", true),
    likert("k08", "ketelitian", "Saya sering lupa mengembalikan barang ke tempat semula.", true),
    likert("k09", "stabilitas_emosi", "Saya merasa tenang hampir sepanjang waktu."),
    likert("k10", "keterbukaan", "Saya tidak tertarik pada ide-ide abstrak.", true),
    likert("k11", "ekstraversi", "Saya mengobrol dengan banyak orang berbeda saat menghadiri acara."),
    likert("k12", "keramahan", "Saya ikut merasakan emosi orang lain."),
    likert("k13", "ketelitian", "Saya menyukai keteraturan."),
    likert("k14", "stabilitas_emosi", "Saya mudah merasa kesal.", true),
    likert("k15", "keterbukaan", "Saya kesulitan memahami ide-ide abstrak.", true),
    likert("k16", "ekstraversi", "Saya lebih suka berada di belakang layar.", true),
    likert("k17", "keramahan", "Saya tidak terlalu tertarik pada orang lain.", true),
    likert("k18", "ketelitian", "Saya sering membuat segala sesuatu menjadi berantakan.", true),
    likert("k19", "stabilitas_emosi", "Saya jarang merasa murung."),
    likert("k20", "keterbukaan", "Imajinasi saya kurang berkembang.", true),
  ],
};
