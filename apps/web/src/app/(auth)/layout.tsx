import { Brain } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-600 p-12 text-white lg:flex lg:flex-col">
        <Link href="/" className="inline-flex items-center gap-2 font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-white/15">
            <Brain className="size-4.5" aria-hidden />
          </span>
          Belajar Psikotest
        </Link>
        <div className="mt-auto max-w-md">
          <p className="text-3xl leading-tight font-bold">Persiapkan diri menghadapi psikotes dengan percaya diri.</p>
          <p className="mt-4 text-indigo-100">
            Lima jenis tes: kepribadian, numerik, verbal, penalaran logis, dan ketelitian, lengkap dengan hasil dan
            interpretasi.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-white/10 blur-2xl" />
      </aside>
      <main className="flex flex-col px-4 py-10 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-center text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600">
            ← Kembali ke beranda
          </Link>
        </p>
      </main>
    </div>
  );
}
