import { TESTS } from "@psikotest/core";
import { ArrowRight, ChartColumn, Clock, ListChecks, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { TestIcon } from "@/components/test-icon";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Halaman statis (dirender saat build) supaya terbuka instan dari CDN.
export const dynamic = "force-static";

const features = [
  {
    icon: Clock,
    title: "Simulasi berwaktu",
    text: "Setiap tes memiliki batas waktu seperti psikotes sungguhan. Jawaban tersimpan otomatis.",
  },
  {
    icon: LockKeyhole,
    title: "Hasil setelah semua selesai",
    text: "Hasil lengkap terbuka setelah seluruh rangkaian tes dikerjakan agar tidak memengaruhi jawaban.",
  },
  {
    icon: ChartColumn,
    title: "Interpretasi jelas",
    text: "Skor per bagian untuk tes kemampuan dan profil lima dimensi untuk tes kepribadian.",
  },
  {
    icon: ShieldCheck,
    title: "Aman & privat",
    text: "Kunci jawaban tidak pernah dikirim ke browser dan penilaian dihitung di server.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonClass({ variant: "ghost" })}>
            Masuk
          </Link>
          <Link href="/register" className={buttonClass()}>
            Daftar
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-40 -z-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
            <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {TESTS.length} jenis psikotes · gratis
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-6xl">
              Latihan psikotes online, <span className="text-indigo-600">siap hadapi seleksi</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-slate-600">
              Kerjakan tes kepribadian, numerik, verbal, penalaran logis, dan ketelitian dalam satu tempat. Lihat hasil
              lengkap setelah semua tes selesai.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className={buttonClass({ size: "lg" })}>
                Mulai Sekarang <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/login" className={buttonClass({ size: "lg", variant: "secondary" })}>
                Saya sudah punya akun
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="tes">
          <h2 id="tes" className="text-center text-2xl font-bold text-slate-900">
            Rangkaian psikotes
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TESTS.map((t) => (
              <Card key={t.slug} className="p-5">
                <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <TestIcon slug={t.slug} className="size-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{t.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.description}</p>
                <p className="mt-3 flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden /> {t.durationMinutes} mnt
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ListChecks className="size-3.5" aria-hidden /> {t.questions.length} soal
                  </span>
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title}>
                <f.icon className="size-6 text-indigo-600" aria-hidden />
                <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Belajar Psikotest · Hasil bersifat latihan, bukan diagnosis psikologis.
      </footer>
    </div>
  );
}
